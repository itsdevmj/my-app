"use client";

/* ===========================================================================
   Gallery + buy box. Client-side because it holds the selected image,
   variant and quantity, and talks to the cart.
   ========================================================================= */

import Image from "next/image";
import { useState } from "react";
import { price, variants, type Product } from "@/app/lib/shop";
import { useCart } from "../cart";

export function ProductGallery({ product }: { product: Product }) {
    const [shown, setShown] = useState(0);

    return (
        <div>
            <div className="media relative aspect-[4/3] rounded-xl">
                <Image
                    key={product.images[shown]}
                    src={product.images[shown]}
                    alt={`${product.name} — image ${shown + 1} of ${product.images.length}`}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover"
                />
            </div>

            {product.images.length > 1 && (
                <ul className="mt-3 flex gap-3">
                    {product.images.map((src, i) => (
                        <li key={src}>
                            <button
                                type="button"
                                onClick={() => setShown(i)}
                                aria-label={`Show image ${i + 1}`}
                                aria-current={i === shown}
                                className={`media relative size-20 rounded-lg transition-opacity duration-200 ${i === shown
                                    ? "ring-2 ring-accent ring-offset-2 ring-offset-bg"
                                    : "opacity-60 hover:opacity-100"
                                    }`}
                            >
                                <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function BuyBox({ product }: { product: Product }) {
    const { add, whatsappUrl } = useCart();
    /* Products saved without options still need one variant to order against. */
    const options = variants(product);
    const [variant, setVariant] = useState(options[0]);
    const [qty, setQty] = useState(1);
    const orderUrl = whatsappUrl([{ handle: product.handle, variant, qty }]);

    return (
        <div>
            <p className="eyebrow text-fg-dim">
                {product.category}
                {product.digital ? " · Digital download" : " · Ships worldwide"}
            </p>

            <h1 className="h-display mt-4 text-[clamp(2rem,4.5vw,3rem)]">{product.name}</h1>
            <p className="lede mt-3">{product.tagline}</p>

            <div className="mt-6 flex items-baseline gap-3">
                <span className="h-section text-3xl">{price(product.priceNaira)}</span>
                {product.compareAtPriceNaira && (
                    <span className="text-base text-fg-dim line-through">
                        {price(product.compareAtPriceNaira)}
                    </span>
                )}
                {product.compareAtPriceNaira && (
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold tracking-tight text-accent-fg">
                        Save {price(product.compareAtPriceNaira - product.priceNaira)}
                    </span>
                )}
            </div>

            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-fg-muted">
                {product.description}
            </p>

            {/* variant — hidden when there is nothing to choose between */}
            {product.options.length > 1 && (
                <fieldset className="mt-8">
                    <legend className="text-sm font-extrabold tracking-tight">
                        {product.optionLabel}
                    </legend>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {options.map((option) => {
                            const on = option === variant;
                            return (
                                <button
                                    key={option}
                                    type="button"
                                    onClick={() => setVariant(option)}
                                    aria-pressed={on}
                                    className={`rounded-full border px-4 py-2.5 text-sm font-semibold tracking-tight transition-colors duration-200 ${on
                                        ? "border-accent bg-accent text-accent-fg"
                                        : "border-line-strong text-fg-muted hover:border-accent hover:text-accent"
                                        }`}
                                >
                                    {option}
                                </button>
                            );
                        })}
                    </div>
                </fieldset>
            )}

            {/* qty + add */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
                <div className="flex items-center rounded-full border border-line-strong">
                    <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        aria-label="Decrease quantity"
                        className="grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:text-accent"
                    >
                        −
                    </button>
                    <span className="w-8 text-center text-sm font-bold" aria-live="polite">
                        {qty}
                    </span>
                    <button
                        type="button"
                        onClick={() => setQty((q) => Math.min(99, q + 1))}
                        aria-label="Increase quantity"
                        className="grid size-11 place-items-center rounded-full text-fg-muted transition-colors hover:text-accent"
                    >
                        +
                    </button>
                </div>

                <button
                    type="button"
                    disabled={!product.inStock}
                    onClick={() => add(product.handle, variant, qty)}
                    className="flex-1 rounded-full bg-accent px-8 py-4 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                >
                    {product.inStock ? `Add to cart — ${price(product.priceNaira * qty)}` : "Sold out"}
                </button>
                {product.inStock && orderUrl && (
                    <a
                        href={orderUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex-1 rounded-full border border-[#25D366]/70 px-6 py-4 text-center text-sm font-bold tracking-tight text-[#6ee7a1] transition-colors hover:bg-[#25D366] hover:text-[#071c0e] sm:flex-none"
                    >
                        Buy on WhatsApp
                    </a>
                )}
            </div>

            {!product.inStock && (
                <p className="mt-3 text-sm text-fg-dim">
                    This edition has sold out. Email us and we&apos;ll tell you when the
                    next run is printed.
                </p>
            )}

            {/* includes */}
            <div className="mt-10 border-t border-line pt-6">
                <h2 className="text-sm font-extrabold tracking-tight">What&apos;s included</h2>
                <ul className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                    {product.includes.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-fg-muted">
                            <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                            {item}
                        </li>
                    ))}
                </ul>
            </div>

            <p className="mt-8 text-xs leading-relaxed text-fg-dim">
                {product.digital
                    ? "Download link is issued immediately after payment. Licences cover commercial use; digital goods are non-refundable."
                    : "Made to order and dispatched within 3–5 working days. Returns accepted within 30 days in original packaging."}
            </p>
        </div>
    );
}
