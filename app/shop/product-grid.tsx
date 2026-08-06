"use client";

/* ===========================================================================
   Product grid + category filter.
   The active category is held in the URL (?category=Prints) so it survives a
   reload and can be linked to directly from the nav and footer.
   ========================================================================= */

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
    PRODUCTS,
    SHOP_CATEGORIES,
    countIn,
    price,
    type ShopCategory,
} from "@/app/lib/shop";
import { useCart } from "./cart";

function isCategory(value: string | null): value is ShopCategory {
    return !!value && (SHOP_CATEGORIES as readonly string[]).includes(value);
}

export function ProductGrid() {
    const router = useRouter();
    const params = useSearchParams();
    const raw = params.get("category");
    const active: ShopCategory = isCategory(raw) ? raw : "All";

    const products = useMemo(
        () => (active === "All" ? PRODUCTS : PRODUCTS.filter((p) => p.category === active)),
        [active],
    );

    const select = (category: ShopCategory) => {
        const next = category === "All" ? "/shop" : `/shop?category=${encodeURIComponent(category)}`;
        router.replace(next, { scroll: false });
    };

    return (
        <>
            {/* filters */}
            <div
                role="group"
                aria-label="Filter by category"
                className="flex flex-wrap gap-2 border-b border-line pb-8"
            >
                {SHOP_CATEGORIES.map((category) => {
                    const on = active === category;
                    return (
                        <button
                            key={category}
                            type="button"
                            onClick={() => select(category)}
                            aria-pressed={on}
                            className={`rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-colors duration-200 ${on
                                    ? "border-accent bg-accent text-accent-fg"
                                    : "border-line-strong text-fg-muted hover:border-accent hover:text-accent"
                                }`}
                        >
                            {category}
                            <span className={`ml-2 text-xs ${on ? "text-accent-fg/60" : "text-fg-dim"}`}>
                                {countIn(category)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* grid */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                    <ProductCard key={product.handle} handle={product.handle} />
                ))}
            </div>

            {products.length === 0 && (
                <p className="py-16 text-center text-fg-dim">Nothing here yet.</p>
            )}
        </>
    );
}

function ProductCard({ handle }: { handle: string }) {
    const { add } = useCart();
    const product = PRODUCTS.find((p) => p.handle === handle);
    if (!product) return null;

    return (
        <article className="panel group flex flex-col overflow-hidden rounded-xl">
            <Link
                href={`/shop/${product.handle}`}
                className="media relative aspect-[4/3] rounded-none border-0 border-b border-line"
            >
                <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="media-zoom object-cover"
                />

                {product.badge && (
                    <span className="absolute left-3 top-3 rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold tracking-tight text-accent-fg">
                        {product.badge}
                    </span>
                )}
                {!product.inStock && (
                    <span className="glass absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-tight">
                        Sold out
                    </span>
                )}
            </Link>

            <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h3 className="truncate text-base font-extrabold tracking-tight">
                            <Link href={`/shop/${product.handle}`} className="hover:text-accent">
                                {product.name}
                            </Link>
                        </h3>
                        <p className="mt-1 text-xs uppercase tracking-wider text-fg-dim">
                            {product.category}
                            {product.digital ? " · Digital" : ""}
                        </p>
                    </div>
                    <div className="shrink-0 text-right">
                        <p className="text-base font-extrabold tracking-tight">{price(product.cents)}</p>
                        {product.compareAtCents && (
                            <p className="text-xs text-fg-dim line-through">
                                {price(product.compareAtCents)}
                            </p>
                        )}
                    </div>
                </div>

                <p className="mt-3 flex-1 text-sm leading-relaxed text-fg-muted">
                    {product.tagline}
                </p>

                <div className="mt-5 flex gap-2">
                    <button
                        type="button"
                        disabled={!product.inStock}
                        onClick={() => add(product.handle, product.options[0])}
                        className="flex-1 rounded-full bg-accent px-4 py-3 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 enabled:hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {product.inStock ? "Add to cart" : "Sold out"}
                    </button>
                    <Link
                        href={`/shop/${product.handle}`}
                        className="grid size-11 shrink-0 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent"
                        aria-label={`View details for ${product.name}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 12h14M19 12l-6-6M19 12l-6 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </article>
    );
}
