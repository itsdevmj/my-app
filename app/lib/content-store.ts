/* ===========================================================================
   CONTENT STORE — server only
   ---------------------------------------------------------------------------
   The site's content lives in TypeScript (lib/site.ts, lib/shop.ts). The admin
   writes *overrides* on top of those defaults into .data/content.json, so an
   empty store means "ship the defaults" and nothing can be lost by editing.

   IMPORTANT — this is filesystem persistence. It works in `next dev` and on a
   normal Node server with a writable disk and a single instance. It will NOT
   work on serverless/edge hosting (read-only filesystem) or across multiple
   instances. Before deploying anywhere like that, swap the two functions at the
   bottom for a real database; nothing else needs to change.

   Never import this from a Client Component — it pulls in node:fs.
   ========================================================================= */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS, type Product } from "./shop";
import { ARCHIVE, PROJECTS, STUDIO, type Project, type Shot } from "./site";

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

export type StudioSettings = {
    name: string;
    email: string;
    phone: string;
    address: string;
};

/** Only the fields the admin is allowed to change. */
export type ProductOverride = Partial<
    Pick<Product, "cents" | "compareAtCents" | "badge" | "inStock">
>;

type Overrides = {
    studio?: Partial<StudioSettings>;
    /** Full replacement list once the admin has touched projects. */
    projects?: Project[];
    products?: Record<string, ProductOverride>;
    updatedAt?: string;
};

async function readOverrides(): Promise<Overrides> {
    try {
        return JSON.parse(await readFile(DATA_FILE, "utf8")) as Overrides;
    } catch {
        /* Missing or unreadable file simply means "no overrides yet". */
        return {};
    }
}

async function writeOverrides(next: Overrides) {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
        DATA_FILE,
        JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2),
        "utf8",
    );
}

/* ---------------------------------------------------------------------------
   READ
------------------------------------------------------------------------- */

export async function getStudio(): Promise<StudioSettings> {
    const { studio } = await readOverrides();
    return { ...STUDIO, ...studio };
}

export async function getProjects(): Promise<Project[]> {
    const { projects } = await readOverrides();
    return projects ?? [...PROJECTS];
}

/** Catalogue with admin overrides folded in. */
export async function getProducts(): Promise<Product[]> {
    const { products } = await readOverrides();
    if (!products) return [...PRODUCTS];
    return PRODUCTS.map((product) =>
        products[product.handle] ? { ...product, ...products[product.handle] } : product,
    );
}

export async function getShots(): Promise<readonly Shot[]> {
    return ARCHIVE;
}

export async function getLastSaved(): Promise<string | null> {
    return (await readOverrides()).updatedAt ?? null;
}

/* ---------------------------------------------------------------------------
   WRITE
------------------------------------------------------------------------- */

export async function saveStudio(patch: Partial<StudioSettings>) {
    const current = await readOverrides();
    await writeOverrides({ ...current, studio: { ...current.studio, ...patch } });
}

export async function saveProjects(projects: Project[]) {
    const current = await readOverrides();
    await writeOverrides({ ...current, projects });
}

export async function saveProductOverride(handle: string, patch: ProductOverride) {
    /* Reject unknown handles so a crafted POST cannot inject catalogue entries. */
    if (!PRODUCTS.some((p) => p.handle === handle)) {
        throw new Error(`Unknown product handle: ${handle}`);
    }
    const current = await readOverrides();
    await writeOverrides({
        ...current,
        products: {
            ...current.products,
            [handle]: { ...current.products?.[handle], ...patch },
        },
    });
}

/** Drops every override and returns the site to the values in the source. */
export async function resetAll() {
    await writeOverrides({});
}
