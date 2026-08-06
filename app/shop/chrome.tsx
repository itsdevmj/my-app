"use client";

/* ===========================================================================
   SHOP CHROME — separate nav and footer from the marketing site.
   The shop reads as its own property: a utility bar, a cart, and category
   links instead of the studio's editorial nav.
   ========================================================================= */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SHOP_CATEGORIES, STUDIO_URL } from "@/app/lib/shop";
import { useCart } from "./cart";

export function ShopNav() {
    const { count, open } = useCart();
    const pathname = usePathname();
    const onIndex = pathname === "/shop";

    return (
        <header className="sticky top-0 z-50">
            {/* utility bar */}
            <div className="border-b border-line bg-bg">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 sm:px-8">
                    <p className="eyebrow truncate text-fg-dim">
                        Free delivery on digital · Worldwide shipping on prints
                    </p>
                    <Link
                        href={STUDIO_URL}
                        className="eyebrow hidden shrink-0 text-fg-dim transition-colors hover:text-accent sm:block"
                    >
                        ← Capture Studio
                    </Link>
                </div>
            </div>

            {/* main bar */}
            <div className="border-b border-line bg-surface/85 backdrop-blur-xl">
                <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
                    <Link href="/shop" className="flex shrink-0 items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-md bg-accent">
                            <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                        </span>
                        <span className="text-[15px] font-extrabold tracking-tight">
                            Shop
                        </span>
                    </Link>

                    {/* category links double as the nav, since the catalogue is small */}
                    <nav aria-label="Categories" className="hidden min-w-0 lg:block">
                        <ul className="flex items-center gap-1">
                            {SHOP_CATEGORIES.filter((c) => c !== "All").map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/shop?category=${encodeURIComponent(category)}`}
                                        className="rounded-full px-3.5 py-2 text-sm font-semibold text-fg-muted transition-colors duration-200 hover:bg-surface-3 hover:text-fg"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex shrink-0 items-center gap-2">
                        {!onIndex && (
                            <Link
                                href="/shop"
                                className="hidden rounded-full border border-line-strong px-4 py-2 text-sm font-semibold text-fg-muted transition-colors hover:border-accent hover:text-accent sm:inline-flex"
                            >
                                All products
                            </Link>
                        )}
                        <button
                            type="button"
                            onClick={open}
                            className="inline-flex items-center gap-2.5 rounded-full bg-accent px-5 py-2.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.03]"
                        >
                            Cart
                            <span
                                aria-label={`${count} item${count === 1 ? "" : "s"} in cart`}
                                className="grid min-w-5 place-items-center rounded-full bg-accent-fg/15 px-1.5 text-xs font-extrabold"
                            >
                                {count}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}

export function ShopFooter() {
    return (
        <footer className="border-t border-line bg-surface pb-10 pt-14">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <Link href="/shop" className="flex items-center gap-2.5">
                            <span className="grid size-7 place-items-center rounded-md bg-accent">
                                <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                            </span>
                            <span className="text-[15px] font-extrabold tracking-tight">Shop</span>
                        </Link>
                        <p className="mt-4 text-sm leading-relaxed text-fg-dim">
                            Tools, prints and books from the Capture Studio team. Everything
                            here is something we made or use ourselves.
                        </p>
                    </div>

                    <nav aria-label="Shop categories">
                        <h2 className="text-sm font-extrabold tracking-tight">Shop</h2>
                        <ul className="mt-4 space-y-2.5">
                            {SHOP_CATEGORIES.filter((c) => c !== "All").map((category) => (
                                <li key={category}>
                                    <Link
                                        href={`/shop?category=${encodeURIComponent(category)}`}
                                        className="text-sm text-fg-dim transition-colors hover:text-accent"
                                    >
                                        {category}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav aria-label="Support">
                        <h2 className="text-sm font-extrabold tracking-tight">Support</h2>
                        <ul className="mt-4 space-y-2.5">
                            {["Shipping & returns", "Licence terms", "Download help", "Contact"].map(
                                (item) => (
                                    <li key={item}>
                                        <Link
                                            href="/shop"
                                            className="text-sm text-fg-dim transition-colors hover:text-accent"
                                        >
                                            {item}
                                        </Link>
                                    </li>
                                ),
                            )}
                        </ul>
                    </nav>

                    <div>
                        <h2 className="text-sm font-extrabold tracking-tight">The studio</h2>
                        <p className="mt-4 text-sm leading-relaxed text-fg-dim">
                            Looking to hire us for a film rather than buy something?
                        </p>
                        <Link
                            href={STUDIO_URL}
                            className="mt-3 inline-block text-sm font-bold tracking-tight text-accent underline underline-offset-4"
                        >
                            capturestudio.co
                        </Link>
                    </div>
                </div>

                <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-fg-dim">
                        © {new Date().getFullYear()} Capture Studio. All rights reserved.
                    </p>
                    <p className="text-sm text-fg-dim">
                        Prices in USD · Digital goods are non-refundable
                    </p>
                </div>
            </div>
        </footer>
    );
}
