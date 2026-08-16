"use client";

import { useActionState } from "react";
import { createCategory, type ActionState } from "@/app/admin/actions";
import { Result, Submit, inputClass } from "@/app/admin/ui";

const INITIAL: ActionState = {};

export function CategoryForm({ categories }: { categories: readonly string[] }) {
    const [state, formAction] = useActionState(createCategory, INITIAL);

    return (
        <section className="panel mt-8 rounded-xl p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-sm font-extrabold tracking-tight">Categories</h2>
                    <p className="mt-1 text-xs text-fg-dim">
                        Add a category for the storefront filters and product editor.
                    </p>
                </div>
                <p className="text-xs text-fg-dim">{categories.length} categories</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                    <span
                        key={category}
                        className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg-muted"
                    >
                        {category}
                    </span>
                ))}
            </div>

            <form action={formAction} className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="new-category">
                    New category name
                </label>
                <input
                    id="new-category"
                    name="name"
                    maxLength={40}
                    placeholder="e.g. Courses"
                    required
                    className={`${inputClass} min-w-0 flex-1`}
                />
                <Submit>Add category</Submit>
                <Result state={state} />
            </form>
        </section>
    );
}
