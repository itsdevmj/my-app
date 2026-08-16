/* ===========================================================================
   IMAGE UPLOADS — server only
   ---------------------------------------------------------------------------
   Accepts an image from the admin and returns a URL to store against a project
   or product.

   SECURITY — none of the client's claims are trusted:
     · The declared Content-Type is ignored. The real format is sniffed from
       the file's magic bytes.
     · The client filename is discarded entirely and replaced with a random
       UUID, so path traversal and extension tricks are impossible.
     · SVG is rejected. It can carry script, and it would be served from a
       domain we control.
     · Size is capped before anything is written or transmitted.

   STORAGE — two backends behind one function:
     Cloudinary  used when CLOUDINARY_* is set. Works on serverless, and is
                 the intended production path.
     Local disk  fallback to public/uploads for running without any provider.
                 Needs a single writable instance, so it is dev-only.
   ========================================================================= */

import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import {
    CLOUDINARY_FOLDER,
    CLOUDINARY_HOSTNAME,
    deleteCloudinaryImage,
    isCloudinaryConfigured,
    uploadToCloudinary,
} from "./cloudinary";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/** Content types, derived from the sniffed format rather than from file.type. */
const MIME: Record<string, string> = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    avif: "image/avif",
};

/** Formats we accept, identified by leading bytes rather than by extension. */
const SIGNATURES: readonly {
    ext: string;
    test: (b: Uint8Array) => boolean;
}[] = [
        {
            ext: "jpg",
            test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
        },
        {
            ext: "png",
            test: (b) =>
                b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 &&
                b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a,
        },
        {
            ext: "webp",
            test: (b) =>
                /* "RIFF" .... "WEBP" */
                b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
                b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
        },
        {
            ext: "avif",
            test: (b) =>
                /* "ftyp" at offset 4, then an "avif"/"avis" brand */
                b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70 &&
                b[8] === 0x61 && b[9] === 0x76 && b[10] === 0x69 &&
                (b[11] === 0x66 || b[11] === 0x73),
        },
    ];

export class UploadError extends Error { }

/** Which backend is live, surfaced in the admin so it is never a mystery. */
export const uploadBackend = () =>
    isCloudinaryConfigured() ? "cloudinary" : "local";

/**
 * Validates and stores an uploaded image.
 * @returns an absolute Cloudinary URL, or `/uploads/<uuid>.jpg` locally.
 */
export async function saveUpload(file: File): Promise<string> {
    if (file.size === 0) {
        throw new UploadError("That file is empty.");
    }
    if (file.size > MAX_UPLOAD_BYTES) {
        throw new UploadError(
            `Image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 8MB.`,
        );
    }

    const bytes = new Uint8Array(await file.arrayBuffer());

    /* Sniff the real format. The browser-supplied type is deliberately unused. */
    const match = SIGNATURES.find((s) => s.test(bytes));
    if (!match) {
        throw new UploadError(
            "That is not a JPEG, PNG, WebP or AVIF image. SVG is not accepted.",
        );
    }

    /* Random name, so the client filename never reaches storage. */
    const id = crypto.randomUUID();
    const contentType = MIME[match.ext];

    /* ---- Cloudinary, when configured ---- */
    if (isCloudinaryConfigured()) {
        try {
            const { url } = await uploadToCloudinary(bytes, contentType, id);
            return url;
        } catch (error) {
            /* Surface provider failures as a form error, not a crashed action. */
            throw new UploadError(
                error instanceof Error ? error.message : "Upload failed.",
            );
        }
    }

    /* ---- local disk fallback ---- */
    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(path.join(UPLOAD_DIR, `${id}.${match.ext}`), bytes);

    return `/uploads/${id}.${match.ext}`;
}

/**
 * Reads an optional file field from a submitted form and stores it.
 * Returns null when no file was chosen, so callers can keep the existing image.
 */
export async function saveOptionalUpload(
    value: FormDataEntryValue | null,
): Promise<string | null> {
    if (!value || typeof value === "string") return null;
    if (value.size === 0) return null;
    return saveUpload(value);
}

const UUID_FILE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(?:jpg|png|webp|avif)$/i;
const UUID_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function cloudinaryPublicId(value: string): string | null {
    try {
        const url = new URL(value);
        if (url.protocol !== "https:" || url.hostname !== CLOUDINARY_HOSTNAME) return null;

        const marker = "/image/upload/";
        const markerIndex = url.pathname.indexOf(marker);
        if (markerIndex < 0) return null;

        const tail = decodeURIComponent(url.pathname.slice(markerIndex + marker.length))
            .replace(/^v\d+\//, "")
            .replace(/\.[a-z0-9]+$/i, "");
        const prefix = `${CLOUDINARY_FOLDER}/`;
        if (!tail.startsWith(prefix) || !UUID_ID.test(tail.slice(prefix.length))) return null;
        return tail;
    } catch {
        return null;
    }
}

/** Deletes only uploads created by this app. External image URLs are ignored. */
export async function deleteManagedUpload(value: string): Promise<boolean> {
    if (value.startsWith("/uploads/")) {
        const filename = value.slice("/uploads/".length);
        if (!UUID_FILE.test(filename)) return false;
        try {
            await unlink(path.join(UPLOAD_DIR, filename));
        } catch (error) {
            if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }
        return true;
    }

    if (!isCloudinaryConfigured()) return false;
    const publicId = cloudinaryPublicId(value);
    if (!publicId) return false;
    await deleteCloudinaryImage(publicId);
    return true;
}
