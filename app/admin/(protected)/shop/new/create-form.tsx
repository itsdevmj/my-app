"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createProduct, type ActionState } from "@/app/admin/actions";
import { Field, ImagePicker, Result, Submit, inputClass } from "@/app/admin/ui";

const INITIAL: ActionState = {};

export function ProductCreateForm({ categories }: { categories: readonly string[] }) {
    const [state, formAction] = useActionState(createProduct, INITIAL);

    return (
        <form action={formAction}>
            <section className="panel rounded-lg p-5 sm:p-6">
                <h2 className="text-sm font-extrabold tracking-tight">Product image</h2>
                <p className="mt-1 text-xs leading-relaxed text-fg-dim">
                    This becomes the main storefront image. You can add more images after creating the product.
                </p>
                <div className="mt-5">
                    <ImagePicker label="Main image" allowUrl={false} required />
                </div>
            </section>

            <section className="panel mt-4 rounded-lg p-5 sm:p-6">
                <h2 className="text-sm font-extrabold tracking-tight">Product details</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Name">
                        <input
                            name="name"
                            required
                            maxLength={100}
                            placeholder="Halide LUT Pack"
                            className={inputClass}
                        />
                    </Field>
                    <Field
                        label="Handle"
                        hint="Optional. Leave blank to create it from the product name."
                    >
                        <input
                            name="handle"
                            maxLength={80}
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            placeholder="halide-lut-pack"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tagline">
                        <input
                            name="tagline"
                            maxLength={140}
                            placeholder="A short line shown under the product name"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Category">
                        <select name="category" required defaultValue="" className={inputClass}>
                            <option value="" disabled>
                                Select a category
                            </option>
                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </Field>
                </div>

                <Field label="Description" className="mt-4">
                    <textarea
                        name="description"
                        rows={6}
                        maxLength={4000}
                        placeholder="Describe the product, how it is delivered, and what makes it useful."
                        className={`${inputClass} resize-y leading-relaxed`}
                    />
                </Field>
            </section>

            <section className="panel mt-4 rounded-lg p-5 sm:p-6">
                <h2 className="text-sm font-extrabold tracking-tight">Pricing and availability</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field label="Price (Naira)">
                        <input
                            name="priceNaira"
                            type="number"
                            min={0}
                            max={100000000}
                            step={1}
                            required
                            placeholder="8900"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Compare-at price" hint="Optional. Must be higher than the selling price.">
                        <input
                            name="comparePriceNaira"
                            type="number"
                            min={0}
                            max={100000000}
                            step={1}
                            placeholder="12000"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Badge" hint="Optional card label, such as New or Best seller.">
                        <input
                            name="badge"
                            maxLength={24}
                            placeholder="New"
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
                    <label className="flex items-center gap-2.5 text-sm font-semibold">
                        <input name="digital" type="checkbox" className="size-4 accent-accent" />
                        Digital product
                    </label>
                    <label className="flex items-center gap-2.5 text-sm font-semibold">
                        <input
                            name="inStock"
                            type="checkbox"
                            defaultChecked
                            className="size-4 accent-accent"
                        />
                        In stock
                    </label>
                </div>
            </section>

            <section className="panel mt-4 rounded-lg p-5 sm:p-6">
                <h2 className="text-sm font-extrabold tracking-tight">Options and included items</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Option label" hint="For example: Licence, Size, Colour, or Format.">
                        <input name="optionLabel" maxLength={40} placeholder="Size" className={inputClass} />
                    </Field>
                    <Field label="Options" hint="Separate each option with a comma or new line.">
                        <textarea
                            name="options"
                            rows={4}
                            placeholder={"A3\nA2\nA1"}
                            className={`${inputClass} resize-y`}
                        />
                    </Field>
                </div>
                <Field label="What's included" hint="Add one item per line." className="mt-4">
                    <textarea
                        name="includes"
                        rows={5}
                        placeholder={"Product file or item\nSetup guide\nCommercial licence"}
                        className={`${inputClass} resize-y`}
                    />
                </Field>
            </section>

            <div className="mt-6 flex flex-wrap items-center gap-4">
                <Submit loadingLabel="Creating product">Create product</Submit>
                <Link
                    href="/admin/shop"
                    className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-bold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                    Cancel
                </Link>
                <Result state={state} />
            </div>
        </form>
    );
}
