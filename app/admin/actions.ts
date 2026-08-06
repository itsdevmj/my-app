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
    saveProductOverride,
    saveProjects,
    saveStudio,
    resetAll,
} from "@/app/lib/content-store";
import type { Project } from "@/app/lib/site";

export async function isAuthed() {
    const store = await cookies();
    return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

/** Throws rather than redirects, so a raw POST gets no useful response. */
async function requireAdmin() {
    if (!(await isAuthed())) throw new Error("Unauthorized");
}

/* ---------------------------------------------------------------------------
   SESSION
------------------------------------------------------------------------- */

export type LoginState = { error?: string };

export async function login(
    _prev: LoginState,
    formData: FormData,
): Promise<LoginState> {
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
    const store = await cookies();
    store.delete(SESSION_COOKIE);
    redirect("/admin/login");
}

/* ---------------------------------------------------------------------------
   CONTENT
------------------------------------------------------------------------- */

export async function updateStudio(formData: FormData) {
    await requireAdmin();

    const text = (key: string) => String(formData.get(key) ?? "").trim();

    const name = text("name");
    const email = text("email");
    if (!name || !email.includes("@")) {
        throw new Error("Name is required and email must look like an address.");
    }

    await saveStudio({
        name,
        email,
        phone: text("phone"),
        address: text("address"),
    });

    revalidatePath("/", "layout");
}

export async function updateProduct(formData: FormData) {
    await requireAdmin();

    const handle = String(formData.get("handle") ?? "");
    const dollars = Number(formData.get("dollars"));
    const compareDollars = String(formData.get("compareDollars") ?? "").trim();
    const badge = String(formData.get("badge") ?? "").trim();

    if (!Number.isFinite(dollars) || dollars < 0 || dollars > 100_000) {
        throw new Error("Price must be a number between 0 and 100,000.");
    }

    await saveProductOverride(handle, {
        cents: Math.round(dollars * 100),
        compareAtCents: compareDollars ? Math.round(Number(compareDollars) * 100) : undefined,
        badge: badge || undefined,
        inStock: formData.get("inStock") === "on",
    });

    revalidatePath("/shop");
    revalidatePath(`/shop/${handle}`);
    revalidatePath("/admin/shop");
}

export async function updateProjects(formData: FormData) {
    await requireAdmin();

    /* The form posts parallel arrays, one entry per row. */
    const titles = formData.getAll("title").map(String);
    const clients = formData.getAll("client").map(String);
    const tags = formData.getAll("tag").map(String);
    const years = formData.getAll("year").map(String);
    const images = formData.getAll("image").map(String);

    const projects: Project[] = titles
        .map((title, i) => ({
            title: title.trim(),
            client: (clients[i] ?? "").trim(),
            tag: (tags[i] ?? "").trim(),
            year: (years[i] ?? "").trim(),
            image: (images[i] ?? "").trim(),
            featured: i === 0,
        }))
        /* Blank title is how a row is deleted. */
        .filter((p) => p.title.length > 0 && p.image.length > 0);

    await saveProjects(projects);

    revalidatePath("/");
    revalidatePath("/admin/work");
}

export async function resetContent() {
    await requireAdmin();
    await resetAll();
    revalidatePath("/", "layout");
}
