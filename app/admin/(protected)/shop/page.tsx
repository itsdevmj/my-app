import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getProducts, getShopCategories } from "@/app/lib/content-store";
import { price } from "@/app/lib/shop";
import { bulkDeleteProducts, toggleStock } from "@/app/admin/actions";
import {
    BulkActionsBar,
    BulkSelection,
    SelectAllCheckbox,
    SelectionCheckbox,
} from "@/app/admin/bulk-selection";
import { CategoryForm } from "./category-form";
import { DeleteProductButton, ShopActionToast } from "./product-controls";

export const metadata: Metadata = { title: "Shop" };

type PageProps = {
    searchParams: Promise<{ kind?: string; toast?: string }>;
};

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="panel rounded-lg px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-fg-dim">{label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">{value}</p>
        </div>
    );
}

export default async function AdminShopPage({ searchParams }: PageProps) {
    const [products, categories, params] = await Promise.all([
        getProducts(),
        getShopCategories(),
        searchParams,
    ]);
    const inStock = products.filter((product) => product.inStock).length;
    const digital = products.filter((product) => product.digital).length;

    return (
        <div className="mx-auto max-w-6xl">
            <ShopActionToast
                message={params.toast}
                kind={params.kind === "error" ? "error" : "success"}
            />

            <header className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <h1 className="h-section text-3xl sm:text-4xl">Shop catalogue</h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                        Manage pricing, availability, images and storefront categories.
                    </p>
                </div>
                <Link
                    href="/shop"
                    className="rounded-full border border-line-strong px-4 py-2 text-xs font-bold tracking-tight text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                    View live shop ↗
                </Link>
            </header>

            <div className="mt-7 grid grid-cols-3 gap-3">
                <Stat label="Products" value={String(products.length)} />
                <Stat label="In stock" value={String(inStock)} />
                <Stat label="Digital" value={String(digital)} />
            </div>

            <CategoryForm categories={categories} />

            <BulkSelection
                action={bulkDeleteProducts}
                ids={products.map((product) => product.handle)}
                noun="product(s)"
            >
            <BulkActionsBar />
            <section className="panel mt-6 overflow-hidden rounded-lg">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight">Products</h2>
                        <p className="mt-1 text-xs text-fg-dim">
                            Stock changes apply immediately to the storefront.
                        </p>
                    </div>
                    <p className="text-xs text-fg-dim">{products.length} total</p>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full min-w-[820px] border-collapse text-left">
                        <thead className="bg-surface-2/60 text-[11px] uppercase tracking-wider text-fg-dim">
                            <tr>
                                <th className="w-12 px-3 py-3 text-center font-medium">
                                    <SelectAllCheckbox />
                                </th>
                                <th className="px-5 py-3 font-medium">Product</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 text-right font-medium">Price</th>
                                <th className="px-4 py-3 font-medium">Availability</th>
                                <th className="px-5 py-3 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {products.map((product) => (
                                <tr key={product.handle} className="transition-colors hover:bg-surface-2/40">
                                    <td className="px-3 py-3.5 text-center">
                                        <SelectionCheckbox
                                            id={product.handle}
                                            label={`Select ${product.name}`}
                                            className="mx-auto border-0 bg-transparent"
                                        />
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-3">
                                            <Link
                                                href={`/admin/shop/${product.handle}`}
                                                className="media relative size-14 shrink-0 rounded-lg"
                                            >
                                                <Image
                                                    src={product.images[0]}
                                                    alt=""
                                                    fill
                                                    sizes="56px"
                                                    className="object-cover"
                                                />
                                            </Link>
                                            <div className="min-w-0">
                                                <Link
                                                    href={`/admin/shop/${product.handle}`}
                                                    className="block max-w-72 truncate text-sm font-extrabold tracking-tight hover:text-accent"
                                                >
                                                    {product.name}
                                                </Link>
                                                <p className="mt-1 max-w-72 truncate text-xs text-fg-dim">
                                                    {product.category} · {product.images.length} image
                                                    {product.images.length === 1 ? "" : "s"}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-xs text-fg-muted">
                                        {product.digital ? "Digital" : "Physical"}
                                    </td>
                                    <td className="px-4 py-3.5 text-right">
                                        <p className="text-sm font-extrabold tracking-tight">
                                            {price(product.priceNaira)}
                                        </p>
                                        {product.compareAtPriceNaira && (
                                            <p className="mt-0.5 text-[11px] text-fg-dim line-through">
                                                {price(product.compareAtPriceNaira)}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-3.5">
                                        <form action={toggleStock}>
                                            <input type="hidden" name="handle" value={product.handle} />
                                            <input
                                                type="hidden"
                                                name="inStock"
                                                value={product.inStock ? "false" : "true"}
                                            />
                                            <button
                                                type="submit"
                                                title={product.inStock ? "Mark as sold out" : "Mark as in stock"}
                                                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold tracking-tight transition-colors ${product.inStock
                                                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/20"
                                                        : "border-line-strong text-fg-dim hover:border-accent hover:text-accent"
                                                    }`}
                                            >
                                                <span
                                                    aria-hidden
                                                    className={`size-1.5 rounded-full ${product.inStock ? "bg-emerald-400" : "bg-fg-dim"}`}
                                                />
                                                {product.inStock ? "In stock" : "Sold out"}
                                            </button>
                                        </form>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link
                                                href={`/shop/${product.handle}`}
                                                className="rounded-md px-2.5 py-2 text-xs font-bold text-fg-dim transition-colors hover:bg-surface-3 hover:text-fg"
                                            >
                                                Preview
                                            </Link>
                                            <Link
                                                href={`/admin/shop/${product.handle}`}
                                                className="rounded-md border border-line-strong px-3 py-2 text-xs font-bold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                                            >
                                                Edit
                                            </Link>
                                            <DeleteProductButton
                                                handle={product.handle}
                                                name={product.name}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
            </BulkSelection>
        </div>
    );
}
