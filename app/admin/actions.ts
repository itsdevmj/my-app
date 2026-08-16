"use server";

/* ===========================================================================
   ADMIN SERVER ACTIONS
   ---------------------------------------------------------------------------
   Server Functions are reachable by direct POST, not only through our own UI,
   so EVERY mutating action below calls requireAdmin() itself. The Proxy gate on
   /admin is defence in depth, not the authorisation check.
   ========================================================================= */

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
    SESSION_COOKIE,
    SESSION_TTL_MS,
    createSessionToken,
    isConfigured,
    verifyPassword,
    verifySessionToken,
} from "@/app/lib/admin-auth";
import {
    addArchiveShot,
    addProject,
    addShopCategory,
    getProduct,
    getProducts,
    getProject,
    getProjects,
    getShots,
    moveProject,
    removeProject,
    removeProductRecord,
    removeArchiveShot,
    resetAll,
    patchProductRecord,
    saveProductRecord,
    saveStudio,
    updateProject,
} from "@/app/lib/content-store";
import {
    UploadError,
    deleteManagedUpload,
    saveOptionalUpload,
} from "@/app/lib/uploads";
import {
    getSupabaseAdminUser,
    isSupabaseAdminUser,
    supabaseAuthServerClient,
} from "@/app/lib/supabase-auth";
import { isSupabaseAuthConfigured } from "@/app/lib/supabase";

export async function isAuthed() {
    if (isSupabaseAuthConfigured()) {
        return Boolean(await getSupabaseAdminUser());
    }

    const store = await cookies();
    return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throws rather than redirects, so a raw POST gets no useful response. */
async function requireAdmin() {
    if (!(await isAuthed())) throw new Error("Unauthorized");
}

const text = (formData: FormData, key: string) =>
    String(formData.get(key) ?? "").trim();

const selectedIds = (formData: FormData) =>
    [...new Set(formData.getAll("ids").map(String).map((id) => id.trim()).filter(Boolean))];

/** Shape returned by every form action, so the UI can report success/failure. */
export type ActionState = { ok?: string; error?: string };

/** Wraps an action so upload/validation problems surface as text, not a crash. */
async function attempt(run: () => Promise<string>): Promise<ActionState> {
    try {
        return { ok: await run() };
    } catch (error) {
        if (error instanceof UploadError) return { error: error.message };
        if (error instanceof Error && error.message === "Unauthorized") throw error;
        return {
            error: error instanceof Error ? error.message : "Something went wrong.",
        };
    }
}

async function discardUpload(value: string | null) {
    if (!value) return;
    await deleteManagedUpload(value).catch(() => undefined);
}

async function cleanupUnusedUploads(candidates: readonly string[]) {
    const unique = [...new Set(candidates.filter(Boolean))];
    if (unique.length === 0) return;

    const [products, projects, shots] = await Promise.all([
        getProducts(),
        getProjects(),
        getShots(),
    ]);
    const referenced = new Set([
        ...products.flatMap((product) => product.images),
        ...projects.map((project) => project.image),
        ...shots.map((shot) => shot.image),
    ]);

    await Promise.allSettled(
        unique.filter((value) => !referenced.has(value)).map(deleteManagedUpload),
    );
}

/* ---------------------------------------------------------------------------
   SESSION
------------------------------------------------------------------------- */

export type LoginState = { error?: string };

export async function login(
    _prev: LoginState,
    formData: FormData,
): Promise<LoginState> {
    if (isSupabaseAuthConfigured()) {
        const email = text(formData, "email").toLowerCase();
        const password = String(formData.get("password") ?? "");

        if (!email || !email.includes("@") || !password) {
            return { error: "Enter your admin email and password." };
        }

        const client = await supabaseAuthServerClient();
        const { data, error } = await client.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !isSupabaseAdminUser(data.user)) {
            await client.auth.signOut().catch(() => undefined);
            return { error: "That email or password is not correct." };
        }

        redirect("/admin");
    }

    if (!isConfigured()) {
        return {
            error:
                "Admin is not configured. Set ADMIN_PASSWORD and ADMIN_SECRET in .env.local, then restart the server.",
        };
    }

    const submitted = String(formData.get("password") ?? "");

    /* Blunt throttle against scripted guessing. Not a substitute for a strong
       password, but it makes brute force impractical at this scale. */
    await new Promise((r) => setTimeout(r, 400));

    if (!verifyPassword(submitted)) {
        return { error: "That password is not right." };
    }

    const store = await cookies();
    store.set(SESSION_COOKIE, await createSessionToken(), {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_TTL_MS / 1000,
    });

    redirect("/admin");
}

export async function logout() {
    if (isSupabaseAuthConfigured()) {
        const client = await supabaseAuthServerClient();
        await client.auth.signOut().catch(() => undefined);
    }

    const store = await cookies();
    store.delete(SESSION_COOKIE);
    redirect("/admin/login");
}

/* ---------------------------------------------------------------------------
   STUDIO SETTINGS
------------------------------------------------------------------------- */

export async function updateStudio(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const name = text(formData, "name");
        const email = text(formData, "email");
        if (!name) throw new Error("Studio name is required.");
        if (!email.includes("@")) throw new Error("That email does not look right.");

        await saveStudio({
            name,
            email,
            phone: text(formData, "phone"),
            address: text(formData, "address"),
        });

        revalidatePath("/", "layout");
        return "Settings saved.";
    });
}

/* ---------------------------------------------------------------------------
   FEATURED WORK
------------------------------------------------------------------------- */

function readProjectFields(formData: FormData) {
    const title = text(formData, "title");
    const client = text(formData, "client");
    if (!title) throw new Error("A title is required.");
    return {
        title,
        client,
        tag: text(formData, "tag"),
        year: text(formData, "year"),
    };
}

export async function createProject(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const fields = readProjectFields(formData);
        const uploaded = await saveOptionalUpload(formData.get("file"));
        const image = uploaded ?? text(formData, "imageUrl");

        if (!image) {
            throw new Error("Add an image — upload a file or paste a URL.");
        }

        try {
            await addProject({ ...fields, image });
        } catch (error) {
            await discardUpload(uploaded);
            throw error;
        }
        revalidatePath("/");
        revalidatePath("/admin/work");
        return `“${fields.title}” added.`;
    });
}

export async function saveProject(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const id = text(formData, "id");
        const fields = readProjectFields(formData);
        const current = await getProject(id);
        if (!current) throw new Error("That project no longer exists.");

        /* A new upload wins; otherwise keep whatever the row already had. */
        const uploaded = await saveOptionalUpload(formData.get("file"));
        const image = uploaded ?? text(formData, "imageUrl");
        if (!image) throw new Error("This project needs an image.");

        try {
            await updateProject(id, { ...fields, image });
        } catch (error) {
            await discardUpload(uploaded);
            throw error;
        }
        if (current.image !== image) await cleanupUnusedUploads([current.image]);
        revalidatePath("/");
        revalidatePath("/admin/work");
        return "Saved.";
    });
}

export async function deleteProject(formData: FormData) {
    await requireAdmin();
    const image = await removeProject(String(formData.get("id") ?? ""));
    if (image) await cleanupUnusedUploads([image]);
    revalidatePath("/");
    revalidatePath("/admin/work");
}

export async function bulkDeleteProjects(formData: FormData) {
    await requireAdmin();
    const ids = selectedIds(formData);
    let kind: "success" | "error" = "success";
    let message: string;

    try {
        const projects = await getProjects();
        const selected = projects.filter((project) => ids.includes(project.id));
        if (selected.length === 0) throw new Error("Select at least one project.");

        const images: string[] = [];
        for (const project of selected) {
            const image = await removeProject(project.id);
            if (image) images.push(image);
        }
        await cleanupUnusedUploads(images);
        revalidatePath("/");
        revalidatePath("/admin/work");
        message = `${selected.length} project${selected.length === 1 ? "" : "s"} deleted.`;
    } catch (error) {
        kind = "error";
        message = error instanceof Error ? error.message : "Deleting projects failed.";
    }

    redirect(`/admin/work?kind=${kind}&toast=${encodeURIComponent(message)}`);
}

export async function reorderProject(formData: FormData) {
    await requireAdmin();
    const direction = Number(formData.get("direction")) === -1 ? -1 : 1;
    await moveProject(String(formData.get("id") ?? ""), direction);
    revalidatePath("/");
    revalidatePath("/admin/work");
}

/* ---------------------------------------------------------------------------
   SHOP
------------------------------------------------------------------------- */

export async function saveProduct(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const handle = text(formData, "handle");
        const current = await getProduct(handle);
        if (!current) throw new Error("That product no longer exists.");

        const naira = Number(formData.get("priceNaira"));
        if (!Number.isFinite(naira) || naira < 0 || naira > 100_000_000) {
            throw new Error("Price must be a naira amount between 0 and 100,000,000.");
        }

        const compare = text(formData, "comparePriceNaira");
        const compareNumber = compare ? Number(compare) : NaN;
        if (compare && (!Number.isFinite(compareNumber) || compareNumber <= naira)) {
            throw new Error("The “was” price has to be higher than the price.");
        }

        const name = text(formData, "name");
        const tagline = text(formData, "tagline");
        const category = text(formData, "category");
        if (!name) throw new Error("Product name is required.");
        if (!category || category.toLowerCase() === "all") {
            throw new Error("Choose a valid product category.");
        }

        /* Existing images are posted back as hidden inputs, so removals here are
           what actually deletes one. A new upload goes to the front. */
        const kept = formData.getAll("keepImage").map(String).filter(Boolean);
        const uploaded = await saveOptionalUpload(formData.get("file"));
        const images = uploaded ? [uploaded, ...kept] : kept;

        if (images.length === 0) {
            throw new Error("Keep at least one image.");
        }

        try {
            await saveProductRecord(handle, {
                name,
                tagline,
                category,
                description: text(formData, "description"),
                priceNaira: Math.round(naira),
                compareAtPriceNaira: compare ? Math.round(compareNumber) : undefined,
                badge: text(formData, "badge") || undefined,
                inStock: formData.get("inStock") === "on",
                images,
            });
        } catch (error) {
            await discardUpload(uploaded);
            throw error;
        }

        await cleanupUnusedUploads(current.images.filter((image) => !images.includes(image)));

        revalidatePath("/shop");
        revalidatePath(`/shop/${handle}`);
        revalidatePath("/admin/shop");
        revalidatePath(`/admin/shop/${handle}`);
        return "Product saved.";
    });
}

/** Quick toggle from the shop list, without opening the editor. */
export async function toggleStock(formData: FormData) {
    await requireAdmin();
    const handle = String(formData.get("handle") ?? "");
    await patchProductRecord(handle, {
        inStock: formData.get("inStock") === "true",
    });
    revalidatePath("/shop");
    revalidatePath(`/shop/${handle}`);
    revalidatePath("/admin/shop");
}

export async function deleteProduct(formData: FormData) {
    await requireAdmin();
    const handle = text(formData, "handle");
    let kind: "success" | "error" = "success";
    let message: string;

    try {
        const product = await getProduct(handle);
        if (!product) throw new Error("That product no longer exists.");

        const images = await removeProductRecord(handle);
        await cleanupUnusedUploads(images);
        revalidatePath("/shop", "layout");
        revalidatePath(`/shop/${handle}`);
        revalidatePath("/admin/shop");
        message = `“${product.name}” deleted.`;
    } catch (error) {
        kind = "error";
        message = error instanceof Error ? error.message : "Deleting the product failed.";
    }

    redirect(
        `/admin/shop?kind=${kind}&toast=${encodeURIComponent(message)}`,
    );
}

export async function bulkDeleteProducts(formData: FormData) {
    await requireAdmin();
    const handles = selectedIds(formData);
    let kind: "success" | "error" = "success";
    let message: string;

    try {
        const products = await getProducts();
        const selected = products.filter((product) => handles.includes(product.handle));
        if (selected.length === 0) throw new Error("Select at least one product.");
        if (selected.length >= products.length) {
            throw new Error("Keep at least one product in the shop.");
        }

        const images: string[] = [];
        for (const product of selected) {
            images.push(...await removeProductRecord(product.handle));
        }
        await cleanupUnusedUploads(images);
        revalidatePath("/shop", "layout");
        revalidatePath("/admin/shop");
        message = `${selected.length} product${selected.length === 1 ? "" : "s"} deleted.`;
    } catch (error) {
        kind = "error";
        message = error instanceof Error ? error.message : "Deleting products failed.";
    }

    redirect(`/admin/shop?kind=${kind}&toast=${encodeURIComponent(message)}`);
}

export async function createCategory(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const name = text(formData, "name");
        if (name.length > 40) throw new Error("Category names must be 40 characters or fewer.");
        await addShopCategory(name);
        revalidatePath("/shop", "layout");
        revalidatePath("/admin/shop");
        return `“${name}” added.`;
    });
}

/* ---------------------------------------------------------------------------
   ARCHIVE
------------------------------------------------------------------------- */

export async function createArchiveShot(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAdmin();

    return attempt(async () => {
        const title = text(formData, "title");
        const uploaded = await saveOptionalUpload(formData.get("file"));
        const image = uploaded ?? text(formData, "imageUrl");
        if (!image) throw new Error("Upload an image or paste an image URL.");

        try {
            await addArchiveShot({
                title,
                project: text(formData, "project"),
                category: text(formData, "category") as "On set",
                ratio: text(formData, "ratio") as "3 / 2",
                image,
            });
        } catch (error) {
            await discardUpload(uploaded);
            throw error;
        }

        revalidatePath("/");
        revalidatePath("/archive");
        revalidatePath("/admin/archive");
        return `“${title}” added to the archive.`;
    });
}

export async function deleteArchiveShot(formData: FormData) {
    await requireAdmin();
    const id = text(formData, "id");
    let kind: "success" | "error" = "success";
    let message: string;

    try {
        const shot = (await getShots()).find((item) => item.id === id);
        if (!shot) throw new Error("That archive image no longer exists.");
        const image = await removeArchiveShot(id);
        await cleanupUnusedUploads([image]);
        revalidatePath("/");
        revalidatePath("/archive");
        revalidatePath("/admin/archive");
        message = `“${shot.title}” deleted.`;
    } catch (error) {
        kind = "error";
        message = error instanceof Error ? error.message : "Deleting the image failed.";
    }

    redirect(`/admin/archive?kind=${kind}&toast=${encodeURIComponent(message)}`);
}

export async function bulkDeleteArchiveShots(formData: FormData) {
    await requireAdmin();
    const ids = selectedIds(formData);
    let kind: "success" | "error" = "success";
    let message: string;

    try {
        const shots = await getShots();
        const selected = shots.filter((shot) => ids.includes(shot.id));
        if (selected.length === 0) throw new Error("Select at least one archive image.");
        if (selected.length >= shots.length) {
            throw new Error("Keep at least one image in the archive.");
        }

        const images: string[] = [];
        for (const shot of selected) {
            images.push(await removeArchiveShot(shot.id));
        }
        await cleanupUnusedUploads(images);
        revalidatePath("/");
        revalidatePath("/archive");
        revalidatePath("/admin/archive");
        message = `${selected.length} archive image${selected.length === 1 ? "" : "s"} deleted.`;
    } catch (error) {
        kind = "error";
        message = error instanceof Error ? error.message : "Deleting archive images failed.";
    }

    redirect(`/admin/archive?kind=${kind}&toast=${encodeURIComponent(message)}`);
}

export async function resetContent() {
    await requireAdmin();
    const [products, projects, shots] = await Promise.all([
        getProducts(),
        getProjects(),
        getShots(),
    ]);
    const previousImages = [
        ...products.flatMap((product) => product.images),
        ...projects.map((project) => project.image),
        ...shots.map((shot) => shot.image),
    ];
    await resetAll();
    await cleanupUnusedUploads(previousImages);
    revalidatePath("/", "layout");
}
