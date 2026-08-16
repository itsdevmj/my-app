"use client";

import { useActionState, useState } from "react";
import type { Product } from "@/app/lib/shop";
import { saveProduct, type ActionState } from "@/app/admin/actions";
import { Field, ImagePicker, Result, Submit, inputClass } from "@/app/admin/ui";

const INITIAL: ActionState = {};

export function ProductEditor({
    product,
    categories,
}: {
    product: Product;
    categories: readonly string[];
}) {
    const [state, formAction] = useActionState(saveProduct, INITIAL);

    /* Existing images post back as hidden inputs. Removing one here is what
       actually deletes it on save, so nothing changes until you submit. */
    const [images, setImages] = useState<string[]>([...product.images]);

    return (
        <form action={formAction}>
            <input type="hidden" name="handle" value={product.handle} />

            {/* ---- images ---- */}
            <section className="panel rounded-xl p-5">
                <h2 className="text-sm font-extrabold tracking-tight">Images</h2>
                <p className="mt-1 text-xs text-fg-dim">
                    The first image is the one used on cards and in the cart. A new upload
                    is added to the front.
                </p>

                <ul className="mt-4 flex flex-wrap gap-3">
                    {images.map((src, i) => (
                        <li key={src} className="relative">
                            <input type="hidden" name="keepImage" value={src} />
                            <div className="media relative size-24 overflow-hidden rounded-lg">
                                {/* Sources here can be any saved URL, so a plain img is right. */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={src} alt="" className="size-full object-cover" />
                            </div>
                            {i === 0 && (
                                <span className="absolute left-1 top-1 rounded bg-accent px-1.5 py-0.5 text-[10px] font-extrabold text-accent-fg">
                                    Main
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={() => setImages((prev) => prev.filter((s) => s !== src))}
                                aria-label="Remove this image"
                                title="Remove"
                                className="absolute -right-2 -top-2 grid size-6 place-items-center rounded-full border border-line-strong bg-surface text-xs text-fg-muted transition-colors hover:border-accent hover:text-accent"
                            >
                                ✕
                            </button>
                        </li>
                    ))}
                    {images.length === 0 && (
                        <li className="text-xs text-accent">
                            Add an image below — a product needs at least one.
                        </li>
                    )}
                </ul>

                <div className="mt-5 border-t border-line pt-5">
                    <ImagePicker label="Add an image" allowUrl={false} />
                </div>
            </section>

            {/* ---- copy ---- */}
            <section className="panel mt-4 rounded-xl p-5">
                <h2 className="text-sm font-extrabold tracking-tight">Copy</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <Field label="Name">
                        <input
                            name="name"
                            defaultValue={product.name}
                            maxLength={80}
                            required
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tagline">
                        <input
                            name="tagline"
                            defaultValue={product.tagline}
                            maxLength={120}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Category">
                        <select
                            name="category"
                            defaultValue={product.category}
                            className={inputClass}
                        >
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Description" className="mt-3">
                    <textarea
                        name="description"
                        defaultValue={product.description}
                        rows={5}
                        className={`${inputClass} resize-y leading-relaxed`}
                    />
                </Field>
            </section>

            {/* ---- pricing ---- */}
            <section className="panel mt-4 rounded-xl p-5">
                <h2 className="text-sm font-extrabold tracking-tight">Pricing</h2>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Field label="Price (₦)">
                        <input
                            name="priceNaira"
                            type="number"
                            min={0}
                            max={100000000}
                            step="1"
                            required
                            defaultValue={product.priceNaira}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Was (₦)" hint="Leave blank for no sale price.">
                        <input
                            name="comparePriceNaira"
                            type="number"
                            min={0}
                            max={100000000}
                            step="1"
                            defaultValue={product.compareAtPriceNaira ?? ""}
                            placeholder="—"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Badge" hint="Shown on the card, e.g. “New”.">
                        <input
                            name="badge"
                            defaultValue={product.badge ?? ""}
                            maxLength={24}
                            placeholder="—"
                            className={inputClass}
                        />
                    </Field>
                </div>

                <label className="mt-4 flex items-center gap-2.5">
                    <input
                        name="inStock"
                        type="checkbox"
                        defaultChecked={product.inStock}
                        className="size-4 accent-accent"
                    />
                    <span className="text-sm font-semibold">In stock</span>
                </label>
            </section>

            <div className="mt-6 flex items-center gap-4">
                <Submit>Save product</Submit>
                <Result state={state} />
            </div>
        </form>
    );
}
