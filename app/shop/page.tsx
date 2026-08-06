import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { PRODUCTS, price } from "@/app/lib/shop";
import { ProductGrid } from "./product-grid";

/* The hero picks whichever product is flagged as the best seller. */
const HERO = PRODUCTS.find((p) => p.badge === "Best seller") ?? PRODUCTS[0];

export default function ShopIndexPage() {
    return (
        <main className="pb-24">
            {/* ---- hero ---- */}
            <section className="border-b border-line">
                <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-14">
                    <div>
                        <p className="eyebrow text-fg-dim">
                            <span className="text-accent">{HERO.badge}</span> · {HERO.category}
                        </p>
                        <h1 className="h-display mt-5 text-[clamp(2.25rem,5.5vw,3.75rem)]">
                            {HERO.name}
                        </h1>
                        <p className="lede mt-4 max-w-md">{HERO.tagline}</p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href={`/shop/${HERO.handle}`}
                                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.03]"
                            >
                                View the pack
                                <span aria-hidden>→</span>
                            </Link>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-extrabold tracking-tight">
                                    {price(HERO.cents)}
                                </span>
                                {HERO.compareAtCents && (
                                    <span className="text-sm text-fg-dim line-through">
                                        {price(HERO.compareAtCents)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <ul className="mt-10 grid gap-x-8 gap-y-3 border-t border-line pt-6 sm:grid-cols-2">
                            {HERO.includes.map((item) => (
                                <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
                                    <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="media relative aspect-[4/3] rounded-xl lg:aspect-[5/4]">
                        <Image
                            src={HERO.images[0]}
                            alt={HERO.name}
                            fill
                            priority
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            className="object-cover"
                        />
                    </div>
                </div>
            </section>

            {/* ---- catalogue ---- */}
            <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h2 className="h-section text-3xl sm:text-4xl">Everything in the shop</h2>
                        <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                            Grading tools and sound we built for our own edits, plus prints
                            and books from the archive. Digital orders deliver instantly.
                        </p>
                    </div>
                    <p className="shrink-0 text-sm text-fg-dim">{PRODUCTS.length} products</p>
                </div>

                {/* useSearchParams needs a Suspense boundary during prerender */}
                <Suspense
                    fallback={<div className="h-24 animate-pulse rounded-xl bg-surface-2" />}
                >
                    <ProductGrid />
                </Suspense>
            </section>

            {/* ---- reassurance ---- */}
            <section className="border-t border-line">
                <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:grid-cols-3 sm:px-8">
                    {[
                        {
                            title: "Instant digital delivery",
                            body: "LUTs, plates and sound libraries download the moment the order clears. No waiting on a fulfilment queue.",
                        },
                        {
                            title: "Printed properly",
                            body: "Archival pigment on 310gsm cotton rag, hand-numbered, shipped flat and insured rather than rolled in a tube.",
                        },
                        {
                            title: "Made by the crew",
                            body: "Everything here came out of a real shoot or a real edit. If we do not use it ourselves, we do not sell it.",
                        },
                    ].map((item) => (
                        <div key={item.title}>
                            <h3 className="text-base font-extrabold tracking-tight">{item.title}</h3>
                            <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{item.body}</p>
                        </div>
                    ))}
                </div>
            </section>
        </main>
    );
}
