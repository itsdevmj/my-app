/* ===========================================================================
   CONTENT STORE — server only
   ---------------------------------------------------------------------------
   Two interchangeable backends behind one API:

     Supabase  used whenever SUPABASE_URL + SUPABASE_SECRET_KEY are set.
               Tables: settings, projects, products.
     Local     JSON file at .data/content.json. The fallback, so the app still
               runs before a Supabase project exists.

   The product catalogue is stored as complete rows in Supabase. The TypeScript
   catalogue is only the local fallback and the seed used when a new products
   table is empty. The archive remains structural content in TypeScript.

   Never import this from a Client Component; both drivers are server-only.
   ========================================================================= */

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PRODUCTS, SHOP_CATEGORIES, type Product } from "./shop";
import {
    ARCHIVE,
    ARCHIVE_CATEGORIES,
    ARCHIVE_RATIOS,
    PROJECTS,
    STUDIO,
    shotImage,
    type Project,
    type Shot,
} from "./site";
import { isSupabaseConfigured, supabaseAdmin } from "./supabase";

export type StudioSettings = {
    name: string;
    email: string;
    phone: string;
    address: string;
};

/** A project that definitely has an id, which is what the admin works with. */
export type StoredProject = Project & { id: string };
export type StoredShot = Shot & { image: string };

/** The product fields the admin is allowed to change. */
export type ProductPatch = Partial<
    Pick<
        Product,
        | "name"
        | "tagline"
        | "description"
        | "category"
        | "priceNaira"
        | "compareAtPriceNaira"
        | "badge"
        | "inStock"
    >
> & { images?: string[] };

/** Which backend is live, surfaced in the admin so it is never a mystery. */
export const storageBackend = () => (isSupabaseConfigured() ? "supabase" : "local");

/* ===========================================================================
   LOCAL DRIVER — single JSON document
   ========================================================================= */

const DATA_DIR = path.join(process.cwd(), ".data");
const DATA_FILE = path.join(DATA_DIR, "content.json");

type LocalDoc = {
    studio?: Partial<StudioSettings>;
    projects?: StoredProject[];
    products?: Record<string, ProductPatch>;
    deletedProducts?: string[];
    archiveShots?: StoredShot[];
    categories?: string[];
    updatedAt?: string;
};

async function localRead(): Promise<LocalDoc> {
    try {
        return JSON.parse(await readFile(DATA_FILE, "utf8")) as LocalDoc;
    } catch {
        /* Missing or unreadable file simply means "use the local defaults". */
        return {};
    }
}

async function localWrite(next: LocalDoc) {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(
        DATA_FILE,
        JSON.stringify({ ...next, updatedAt: new Date().toISOString() }, null, 2),
        "utf8",
    );
}

/* ===========================================================================
   SHARED HELPERS
   ========================================================================= */

const slug = (value: string) =>
    value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

/** Rejects handles that are not in the catalogue, so a crafted POST cannot
 *  invent products. Used by both drivers. */
function assertKnownHandle(handle: string) {
    if (!PRODUCTS.some((p) => p.handle === handle)) {
        throw new Error(`Unknown product handle: ${handle}`);
    }
}

type LegacyOverrideRow = {
    handle: string;
    name: string | null;
    tagline: string | null;
    description: string | null;
    cents: number | null;
    compare_at_cents: number | null;
    badge: string | null;
    in_stock: boolean | null;
    images: string[] | null;
};

type ProductRow = {
    handle: string;
    name: string;
    tagline: string;
    category: string;
    price_naira: number;
    compare_at_price_naira: number | null;
    badge: string | null;
    digital: boolean;
    images: string[];
    description: string;
    includes: string[];
    option_label: string;
    options: string[];
    in_stock: boolean;
    position: number;
};

type ArchiveShotRow = {
    id: string;
    title: string;
    project: string;
    category: StoredShot["category"];
    ratio: StoredShot["ratio"];
    image: string;
    position: number;
};

/** Converts an old sparse override row during the one-time product seed. */
function legacyRowToOverride(row: LegacyOverrideRow): ProductPatch {
    const out: ProductPatch = {};
    if (row.name !== null) out.name = row.name;
    if (row.tagline !== null) out.tagline = row.tagline;
    if (row.description !== null) out.description = row.description;
    if (row.cents !== null) out.priceNaira = row.cents;
    if (row.compare_at_cents !== null) out.compareAtPriceNaira = row.compare_at_cents;
    if (row.badge !== null) out.badge = row.badge;
    if (row.in_stock !== null) out.inStock = row.in_stock;
    if (row.images !== null) out.images = row.images;
    return out;
}

function applyOverrides(overrides: Record<string, ProductPatch>): Product[] {
    return PRODUCTS.map((product) => {
        const patch = overrides[product.handle];
        if (!patch) return product;
        return {
            ...product,
            ...patch,
            /* Never let an override leave a product with zero images. */
            images: patch.images?.length ? patch.images : product.images,
        };
    });
}

function productToRow(product: Product, position: number): ProductRow {
    return {
        handle: product.handle,
        name: product.name,
        tagline: product.tagline,
        category: product.category,
        price_naira: product.priceNaira,
        compare_at_price_naira: product.compareAtPriceNaira ?? null,
        badge: product.badge ?? null,
        digital: product.digital,
        images: [...product.images],
        description: product.description,
        includes: [...product.includes],
        option_label: product.optionLabel,
        options: [...product.options],
        in_stock: product.inStock,
        position,
    };
}

function rowToProduct(row: ProductRow): Product {
    return {
        handle: row.handle,
        name: row.name,
        tagline: row.tagline,
        category: row.category,
        priceNaira: row.price_naira,
        compareAtPriceNaira: row.compare_at_price_naira ?? undefined,
        badge: row.badge ?? undefined,
        digital: row.digital,
        images: row.images,
        description: row.description,
        includes: row.includes,
        optionLabel: row.option_label,
        options: row.options,
        inStock: row.in_stock,
    };
}

const PRODUCT_COLUMNS = [
    "handle",
    "name",
    "tagline",
    "category",
    "price_naira",
    "compare_at_price_naira",
    "badge",
    "digital",
    "images",
    "description",
    "includes",
    "option_label",
    "options",
    "in_stock",
    "position",
].join(", ");

const ARCHIVE_SHOT_COLUMNS = "id, title, project, category, ratio, image, position";

/** Seeds a new products table, preserving any rows from the former override table. */
async function seedSupabaseProducts() {
    const client = supabaseAdmin();
    const { data, error } = await client
        .from("product_overrides")
        .select(
            "handle, name, tagline, description, cents, compare_at_cents, badge, in_stock, images",
        );
    if (error && error.code !== "42P01") {
        throw new Error(`Reading legacy product data failed: ${error.message}`);
    }

    const overrides: Record<string, ProductPatch> = {};
    for (const row of (data ?? []) as LegacyOverrideRow[]) {
        overrides[row.handle] = legacyRowToOverride(row);
    }

    const rows = applyOverrides(overrides).map(productToRow);
    const { error: seedError } = await client
        .from("products")
        .upsert(rows, { onConflict: "handle", ignoreDuplicates: true });
    if (seedError) throw new Error(`Seeding products failed: ${seedError.message}`);
}

const DEFAULT_CATEGORIES = SHOP_CATEGORIES.filter((category) => category !== "All");

async function seedSupabaseCategories() {
    const { error } = await supabaseAdmin()
        .from("shop_categories")
        .upsert(
            DEFAULT_CATEGORIES.map((name, position) => ({ name, position })),
            { onConflict: "name", ignoreDuplicates: true },
        );
    if (error) throw new Error(`Seeding categories failed: ${error.message}`);
}

function archiveShotToRow(shot: Shot, position: number) {
    return {
        title: shot.title,
        project: shot.project,
        category: shot.category,
        ratio: shot.ratio,
        image: shotImage(shot),
        position,
    };
}

function rowToShot(row: ArchiveShotRow): StoredShot {
    return {
        id: row.id,
        title: row.title,
        project: row.project,
        category: row.category,
        ratio: row.ratio,
        image: row.image,
    };
}

function uniqueShots(shots: readonly StoredShot[]) {
    const seen = new Set<string>();
    return shots.filter((shot) => {
        const key = `${shot.title}\u0000${shot.project}\u0000${shot.image}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

async function seedSupabaseShots() {
    const { error } = await supabaseAdmin().from("archive_shots").insert(
        ARCHIVE.map(archiveShotToRow),
    );
    /* A concurrent first request may win the unique-index race. Its complete
       insert is the seed, so the losing request can simply read those rows. */
    if (error && error.code !== "23505") {
        throw new Error(`Seeding archive failed: ${error.message}`);
    }
}

/* ===========================================================================
   READ
   ========================================================================= */

export async function getStudio(): Promise<StudioSettings> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin()
            .from("settings")
            .select("name, email, phone, address")
            .maybeSingle();
        if (error) throw new Error(`Reading settings failed: ${error.message}`);
        return { ...STUDIO, ...(data ?? {}) };
    }

    const { studio } = await localRead();
    return { ...STUDIO, ...studio };
}

export async function getProjects(): Promise<StoredProject[]> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin()
            .from("projects")
            .select("id, title, client, tag, year, image")
            .order("position", { ascending: true });
        if (error) throw new Error(`Reading projects failed: ${error.message}`);
        return (data ?? []).map((row, i) => ({ ...row, featured: i === 0 }));
    }

    /* Local defaults carry no ids, so derive a stable one from the title. */
    const { projects } = await localRead();
    const list: Project[] = projects ?? [...PROJECTS];
    return list.map((project, i) => ({
        ...project,
        id: project.id ?? (slug(project.title) || `project-${i + 1}`),
        featured: i === 0,
    }));
}

export async function getProject(id: string): Promise<StoredProject | undefined> {
    return (await getProjects()).find((project) => project.id === id);
}

export async function getProducts(): Promise<Product[]> {
    if (isSupabaseConfigured()) {
        const client = supabaseAdmin();
        let { data, error } = await client
            .from("products")
            .select(PRODUCT_COLUMNS)
            .order("position", { ascending: true });
        if (error) throw new Error(`Reading products failed: ${error.message}`);

        if (!data?.length) {
            await seedSupabaseProducts();
            const seeded = await client
                .from("products")
                .select(PRODUCT_COLUMNS)
                .order("position", { ascending: true });
            data = seeded.data;
            error = seeded.error;
            if (error) throw new Error(`Reading seeded products failed: ${error.message}`);
        }

        return ((data ?? []) as unknown as ProductRow[]).map(rowToProduct);
    }

    const { products, deletedProducts } = await localRead();
    const deleted = new Set(deletedProducts ?? []);
    return applyOverrides(products ?? {}).filter((product) => !deleted.has(product.handle));
}

export async function getProduct(handle: string): Promise<Product | undefined> {
    return (await getProducts()).find((p) => p.handle === handle);
}

export async function getShopCategories(): Promise<string[]> {
    if (isSupabaseConfigured()) {
        const client = supabaseAdmin();
        let { data, error } = await client
            .from("shop_categories")
            .select("name")
            .order("position", { ascending: true });
        if (error) throw new Error(`Reading categories failed: ${error.message}`);

        if (!data?.length) {
            await seedSupabaseCategories();
            const seeded = await client
                .from("shop_categories")
                .select("name")
                .order("position", { ascending: true });
            data = seeded.data;
            error = seeded.error;
            if (error) throw new Error(`Reading seeded categories failed: ${error.message}`);
        }

        return (data ?? []).map((row) => String(row.name));
    }

    return (await localRead()).categories ?? [...DEFAULT_CATEGORIES];
}

export async function getShots(): Promise<StoredShot[]> {
    if (isSupabaseConfigured()) {
        const client = supabaseAdmin();
        let { data, error } = await client
            .from("archive_shots")
            .select(ARCHIVE_SHOT_COLUMNS)
            .order("position", { ascending: true });
        if (error) throw new Error(`Reading archive failed: ${error.message}`);

        if (!data?.length) {
            await seedSupabaseShots();
            const seeded = await client
                .from("archive_shots")
                .select(ARCHIVE_SHOT_COLUMNS)
                .order("position", { ascending: true });
            data = seeded.data;
            error = seeded.error;
            if (error) throw new Error(`Reading seeded archive failed: ${error.message}`);
        }

        return uniqueShots(((data ?? []) as unknown as ArchiveShotRow[]).map(rowToShot));
    }

    const { archiveShots } = await localRead();
    return archiveShots ?? ARCHIVE.map((shot) => ({ ...shot, image: shotImage(shot) }));
}

export async function getLastSaved(): Promise<string | null> {
    if (isSupabaseConfigured()) {
        /* Newest touch across the three tables. */
        const client = supabaseAdmin();
        const [settings, projects, products, categories] = await Promise.all([
            client.from("settings").select("updated_at").maybeSingle(),
            client.from("projects").select("updated_at").order("updated_at", { ascending: false }).limit(1),
            client
                .from("products")
                .select("updated_at")
                .order("updated_at", { ascending: false })
                .limit(1),
            client
                .from("shop_categories")
                .select("updated_at")
                .order("updated_at", { ascending: false })
                .limit(1),
        ]);
        const stamps = [
            settings.data?.updated_at,
            projects.data?.[0]?.updated_at,
            products.data?.[0]?.updated_at,
            categories.data?.[0]?.updated_at,
        ].filter((s): s is string => typeof s === "string");
        if (stamps.length === 0) return null;
        return stamps.sort().at(-1) ?? null;
    }

    return (await localRead()).updatedAt ?? null;
}

/* ===========================================================================
   WRITE — studio
   ========================================================================= */

export async function saveStudio(patch: Partial<StudioSettings>) {
    if (isSupabaseConfigured()) {
        const { error } = await supabaseAdmin()
            .from("settings")
            .upsert({ id: true, ...patch, updated_at: new Date().toISOString() });
        if (error) throw new Error(`Saving settings failed: ${error.message}`);
        return;
    }

    const current = await localRead();
    await localWrite({ ...current, studio: { ...current.studio, ...patch } });
}

/* ===========================================================================
   WRITE — projects
   ========================================================================= */

async function localPutProjects(projects: StoredProject[]) {
    const current = await localRead();
    await localWrite({
        ...current,
        projects: projects.map((p, i) => ({ ...p, featured: i === 0 })),
    });
}

/** Rewrites `position` so it always matches array order. */
async function supabaseReindex(ordered: StoredProject[]) {
    const client = supabaseAdmin();
    const stamp = new Date().toISOString();
    const { error } = await client.from("projects").upsert(
        ordered.map((project, i) => ({
            id: project.id,
            title: project.title,
            client: project.client,
            tag: project.tag,
            year: project.year,
            image: project.image,
            position: i,
            updated_at: stamp,
        })),
    );
    if (error) throw new Error(`Reordering projects failed: ${error.message}`);
}

export async function addProject(project: Omit<StoredProject, "id">) {
    if (isSupabaseConfigured()) {
        const existing = await getProjects();
        const { error } = await supabaseAdmin()
            .from("projects")
            .insert({
                title: project.title,
                client: project.client,
                tag: project.tag,
                year: project.year,
                image: project.image,
                position: existing.length,
            });
        if (error) throw new Error(`Adding the project failed: ${error.message}`);
        return;
    }

    const projects = await getProjects();
    await localPutProjects([...projects, { ...project, id: crypto.randomUUID() }]);
}

export async function updateProject(id: string, patch: Partial<StoredProject>) {
    if (isSupabaseConfigured()) {
        const { error, count } = await supabaseAdmin()
            .from("projects")
            .update(
                {
                    title: patch.title,
                    client: patch.client,
                    tag: patch.tag,
                    year: patch.year,
                    image: patch.image,
                    updated_at: new Date().toISOString(),
                },
                { count: "exact" },
            )
            .eq("id", id);
        if (error) throw new Error(`Saving the project failed: ${error.message}`);
        if (count === 0) throw new Error("That project no longer exists.");
        return;
    }

    const projects = await getProjects();
    if (!projects.some((p) => p.id === id)) {
        throw new Error("That project no longer exists.");
    }
    await localPutProjects(projects.map((p) => (p.id === id ? { ...p, ...patch } : p)));
}

export async function removeProject(id: string): Promise<string | null> {
    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin()
            .from("projects")
            .delete()
            .eq("id", id)
            .select("image")
            .maybeSingle();
        if (error) throw new Error(`Deleting the project failed: ${error.message}`);
        /* Close the gap left in the ordering. */
        await supabaseReindex(await getProjects());
        return data?.image ?? null;
    }

    const projects = await getProjects();
    const removed = projects.find((project) => project.id === id);
    await localPutProjects(projects.filter((p) => p.id !== id));
    return removed?.image ?? null;
}

/** Moves a project one slot up or down; a no-op at either end. */
export async function moveProject(id: string, direction: -1 | 1) {
    const projects = await getProjects();
    const from = projects.findIndex((p) => p.id === id);
    const to = from + direction;
    if (from < 0 || to < 0 || to >= projects.length) return;

    const next = [...projects];
    [next[from], next[to]] = [next[to], next[from]];

    if (isSupabaseConfigured()) {
        await supabaseReindex(next);
        return;
    }
    await localPutProjects(next);
}

/* ===========================================================================
   WRITE — products
   ========================================================================= */

export async function saveProductRecord(handle: string, patch: ProductPatch) {
    if (isSupabaseConfigured()) {
        const update: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };
        if ("name" in patch) update.name = patch.name;
        if ("tagline" in patch) update.tagline = patch.tagline;
        if ("description" in patch) update.description = patch.description;
        if ("category" in patch) update.category = patch.category;
        if ("priceNaira" in patch) update.price_naira = patch.priceNaira;
        if ("compareAtPriceNaira" in patch) {
            update.compare_at_price_naira = patch.compareAtPriceNaira ?? null;
        }
        if ("badge" in patch) update.badge = patch.badge ?? null;
        if ("inStock" in patch) update.in_stock = patch.inStock;
        if ("images" in patch) update.images = patch.images;

        const { error, count } = await supabaseAdmin()
            .from("products")
            .update(update, { count: "exact" })
            .eq("handle", handle);
        if (error) throw new Error(`Saving the product failed: ${error.message}`);
        if (count === 0) throw new Error("That product no longer exists.");
        return;
    }

    assertKnownHandle(handle);
    const current = await localRead();
    await localWrite({
        ...current,
        products: {
            ...current.products,
            [handle]: { ...current.products?.[handle], ...patch },
        },
    });
}

/** Deletes a product and returns its images for managed-upload cleanup. */
export async function removeProductRecord(handle: string): Promise<string[]> {
    const products = await getProducts();
    if (products.length <= 1) {
        throw new Error("Keep at least one product in the shop.");
    }

    const currentProduct = products.find((product) => product.handle === handle);
    if (!currentProduct) throw new Error("That product no longer exists.");

    if (isSupabaseConfigured()) {
        const { data, error } = await supabaseAdmin()
            .from("products")
            .delete()
            .eq("handle", handle)
            .select("images")
            .maybeSingle();
        if (error) throw new Error(`Deleting the product failed: ${error.message}`);
        if (!data) throw new Error("That product no longer exists.");
        return Array.isArray(data.images) ? data.images.map(String) : [...currentProduct.images];
    }

    assertKnownHandle(handle);
    const current = await localRead();
    const overrides = { ...current.products };
    delete overrides[handle];
    await localWrite({
        ...current,
        products: overrides,
        deletedProducts: [...new Set([...(current.deletedProducts ?? []), handle])],
    });
    return [...currentProduct.images];
}

export async function addShopCategory(name: string) {
    const clean = name.trim();
    if (!clean || clean.toLowerCase() === "all") {
        throw new Error("Choose a category name other than All.");
    }

    if (isSupabaseConfigured()) {
        const categories = await getShopCategories();
        if (categories.some((category) => category.toLowerCase() === clean.toLowerCase())) {
            throw new Error("That category already exists.");
        }
        const { error } = await supabaseAdmin().from("shop_categories").insert({
            name: clean,
            position: categories.length,
            updated_at: new Date().toISOString(),
        });
        if (error) throw new Error(`Adding the category failed: ${error.message}`);
        return;
    }

    const current = await localRead();
    const categories = current.categories ?? [...DEFAULT_CATEGORIES];
    if (categories.some((category) => category.toLowerCase() === clean.toLowerCase())) {
        throw new Error("That category already exists.");
    }
    await localWrite({ ...current, categories: [...categories, clean] });
}

function assertArchiveCategory(category: string): asserts category is StoredShot["category"] {
    if (!ARCHIVE_CATEGORIES.includes(category as (typeof ARCHIVE_CATEGORIES)[number]) || category === "All") {
        throw new Error("Choose a valid archive category.");
    }
}

function assertArchiveRatio(ratio: string): asserts ratio is StoredShot["ratio"] {
    if (!ARCHIVE_RATIOS.includes(ratio as StoredShot["ratio"])) {
        throw new Error("Choose a valid image ratio.");
    }
}

export async function addArchiveShot(input: Omit<StoredShot, "id">) {
    assertArchiveCategory(input.category);
    assertArchiveRatio(input.ratio);
    if (!input.title.trim()) throw new Error("A title is required.");
    if (!input.image.trim()) throw new Error("Add an image before saving.");

    if (isSupabaseConfigured()) {
        const shots = await getShots();
        const { error } = await supabaseAdmin().from("archive_shots").insert({
            title: input.title.trim(),
            project: input.project.trim(),
            category: input.category,
            ratio: input.ratio,
            image: input.image,
            position: shots.length,
            updated_at: new Date().toISOString(),
        });
        if (error) throw new Error(`Adding the archive image failed: ${error.message}`);
        return;
    }

    const current = await localRead();
    const shots = current.archiveShots ?? await getShots();
    await localWrite({
        ...current,
        archiveShots: [
            ...shots,
            { ...input, id: crypto.randomUUID() },
        ],
    });
}

async function supabaseReindexShots(shots: readonly StoredShot[]) {
    const client = supabaseAdmin();
    const writes = await Promise.all(
        shots.map((shot, position) =>
            client
                .from("archive_shots")
                .update({ position, updated_at: new Date().toISOString() })
                .eq("id", shot.id),
        ),
    );
    const failed = writes.find((write) => write.error);
    if (failed?.error) throw new Error(`Reordering archive failed: ${failed.error.message}`);
}

/** Deletes one archive entry and returns its image for managed-upload cleanup. */
export async function removeArchiveShot(id: string): Promise<string> {
    const shots = await getShots();
    if (shots.length <= 1) throw new Error("Keep at least one image in the archive.");
    const current = shots.find((shot) => shot.id === id);
    if (!current) throw new Error("That archive image no longer exists.");

    if (isSupabaseConfigured()) {
        const { error } = await supabaseAdmin()
            .from("archive_shots")
            .delete()
            .eq("title", current.title)
            .eq("project", current.project)
            .eq("image", current.image);
        if (error) throw new Error(`Deleting the archive image failed: ${error.message}`);
        await supabaseReindexShots(shots.filter((shot) => shot.id !== id));
        return current.image;
    }

    const local = await localRead();
    await localWrite({
        ...local,
        archiveShots: shots.filter((shot) => shot.id !== id),
    });
    return current.image;
}

/** Applies a partial product update without clearing unrelated fields. */
export async function patchProductRecord(handle: string, patch: ProductPatch) {
    assertKnownHandle(handle);
    await saveProductRecord(handle, patch);
}

/** Returns all editable content to the defaults that ship with the app. */
export async function resetAll() {
    if (isSupabaseConfigured()) {
        const client = supabaseAdmin();
        const [products, legacyProducts, projects, categories, archive] = await Promise.all([
            client.from("products").delete().neq("handle", ""),
            client.from("product_overrides").delete().neq("handle", ""),
            client.from("projects").delete().neq("title", ""),
            client.from("shop_categories").delete().neq("name", ""),
            client.from("archive_shots").delete().neq("title", ""),
        ]);
        if (products.error) throw new Error(products.error.message);
        if (legacyProducts.error && legacyProducts.error.code !== "42P01") {
            throw new Error(legacyProducts.error.message);
        }
        if (projects.error) throw new Error(projects.error.message);
        if (categories.error) throw new Error(categories.error.message);
        if (archive.error) throw new Error(archive.error.message);

        /* Put the seeded defaults back so the homepage is not left empty. */
        const stamp = new Date().toISOString();
        const { error } = await client.from("projects").insert(
            PROJECTS.map((project, i) => ({
                title: project.title,
                client: project.client,
                tag: project.tag,
                year: project.year,
                image: project.image,
                position: i,
                updated_at: stamp,
            })),
        );
        if (error) throw new Error(error.message);

        await seedSupabaseProducts();
        await seedSupabaseCategories();
        await seedSupabaseShots();
        await saveStudio(STUDIO);
        return;
    }

    await localWrite({});
}
