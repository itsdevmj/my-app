import type { Metadata } from "next";
import { getStudio } from "@/app/lib/content-store";
import { resetContent, updateStudio } from "../actions";

export const metadata: Metadata = { title: "Settings" };

const FIELDS = [
    { name: "name", label: "Studio name", type: "text", required: true },
    { name: "email", label: "Contact email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel", required: false },
    { name: "address", label: "Address", type: "text", required: false },
] as const;

export default async function AdminSettingsPage() {
    const studio = await getStudio();

    return (
        <div className="mx-auto max-w-2xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Settings</h1>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    Studio details, used across the site footer, contact section and shop.
                </p>
            </header>

            <form action={updateStudio} className="panel mt-8 rounded-xl p-6">
                <div className="space-y-5">
                    {FIELDS.map((field) => (
                        <label key={field.name} className="block">
                            <span className="block text-sm font-semibold">
                                {field.label}
                                {field.required && <span className="text-accent"> *</span>}
                            </span>
                            <input
                                name={field.name}
                                type={field.type}
                                required={field.required}
                                defaultValue={studio[field.name]}
                                className="mt-2 w-full rounded-lg border border-line-strong bg-bg px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent"
                            />
                        </label>
                    ))}
                </div>

                <button
                    type="submit"
                    className="mt-7 rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.02]"
                >
                    Save settings
                </button>
            </form>

            {/* Destructive, so it is separated and labelled plainly. */}
            <section className="mt-8 rounded-xl border border-line p-6">
                <h2 className="text-base font-extrabold tracking-tight">Reset content</h2>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    Discards every override and returns the site to the values written in
                    the source files. This clears your saved prices, stock flags and work
                    list. It cannot be undone.
                </p>
                <form action={resetContent} className="mt-5">
                    <button
                        type="submit"
                        className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-semibold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                        Reset all content to defaults
                    </button>
                </form>
            </section>
        </div>
    );
}
