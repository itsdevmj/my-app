/* ===========================================================================
   CLOUDINARY — server only
   ---------------------------------------------------------------------------
   Signed server-side uploads against the REST Upload API. No SDK needed: the
   signature is a SHA-1 of the alphabetically sorted params with the API secret
   appended, which is all `api_sign_request` does.

   The upload happens from a Server Action, where we already hold the bytes, so
   the file never round-trips through the browser and the secret never leaves
   the server.

   Docs: https://support.cloudinary.com/hc/en-us/articles/203817991-How-to-generate-a-Cloudinary-signature-on-my-own

   NEVER import this from a Client Component, and never prefix the API secret
   with NEXT_PUBLIC_.
   ========================================================================= */

const cloudName =
    process.env.CLOUDINARY_CLOUD_NAME ??
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
    "";
const apiKey = process.env.CLOUDINARY_API_KEY ?? "";
const apiSecret = process.env.CLOUDINARY_API_SECRET ?? "";

/** Everything is uploaded under one folder, so the account stays tidy. */
export const CLOUDINARY_FOLDER = process.env.CLOUDINARY_FOLDER ?? "capture-studio";

export function isCloudinaryConfigured() {
    return cloudName.length > 0 && apiKey.length > 0 && apiSecret.length > 0;
}

/** Delivery hostname, for next.config remotePatterns. */
export const CLOUDINARY_HOSTNAME = "res.cloudinary.com";

async function sha1Hex(input: string) {
    const digest = await crypto.subtle.digest(
        "SHA-1",
        new TextEncoder().encode(input),
    );
    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

/**
 * Signs the params Cloudinary requires: sorted `k=v` pairs joined with `&`,
 * then the API secret appended directly (no separator).
 */
async function sign(params: Record<string, string>) {
    const canonical = Object.keys(params)
        .sort()
        .map((key) => `${key}=${params[key]}`)
        .join("&");
    return sha1Hex(canonical + apiSecret);
}

export type CloudinaryUpload = {
    url: string;
    publicId: string;
};

/**
 * Uploads raw image bytes and returns the HTTPS delivery URL.
 * @param publicId filename without extension — pass a random UUID.
 */
export async function uploadToCloudinary(
    bytes: Uint8Array,
    contentType: string,
    publicId: string,
): Promise<CloudinaryUpload> {
    if (!isCloudinaryConfigured()) {
        throw new Error(
            "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
        );
    }

    /* Only these are signed, and exactly these must also be sent. */
    const signed: Record<string, string> = {
        folder: CLOUDINARY_FOLDER,
        public_id: publicId,
        timestamp: String(Math.floor(Date.now() / 1000)),
    };

    const body = new FormData();
    /* Uint8Array -> Blob so undici sends a proper multipart file part. */
    body.append("file", new Blob([bytes as unknown as BlobPart], { type: contentType }), publicId);
    body.append("api_key", apiKey);
    for (const [key, value] of Object.entries(signed)) body.append(key, value);
    body.append("signature", await sign(signed));

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
    );

    if (!response.ok) {
        /* Cloudinary returns a JSON error body; surface it rather than a bare 4xx. */
        let detail = `HTTP ${response.status}`;
        try {
            const json = (await response.json()) as { error?: { message?: string } };
            if (json.error?.message) detail = json.error.message;
        } catch {
            /* non-JSON body — keep the status code */
        }
        throw new Error(`Cloudinary upload failed: ${detail}`);
    }

    const json = (await response.json()) as {
        secure_url?: string;
        public_id?: string;
    };

    if (!json.secure_url || !json.public_id) {
        throw new Error("Cloudinary upload returned no URL.");
    }

    return { url: json.secure_url, publicId: json.public_id };
}

/** Deletes one image previously uploaded by this app. */
export async function deleteCloudinaryImage(publicId: string): Promise<void> {
    if (!isCloudinaryConfigured()) {
        throw new Error("Cloudinary is not configured.");
    }

    const signed: Record<string, string> = {
        invalidate: "true",
        public_id: publicId,
        timestamp: String(Math.floor(Date.now() / 1000)),
    };
    const body = new FormData();
    body.append("api_key", apiKey);
    for (const [key, value] of Object.entries(signed)) body.append(key, value);
    body.append("signature", await sign(signed));

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        { method: "POST", body },
    );
    if (!response.ok) {
        throw new Error(`Cloudinary deletion failed: HTTP ${response.status}`);
    }

    const json = (await response.json()) as { result?: string };
    if (json.result !== "ok" && json.result !== "not found") {
        throw new Error(`Cloudinary deletion failed: ${json.result ?? "unknown response"}`);
    }
}
