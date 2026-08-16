import type { Metadata } from "next";
import { getStudio } from "@/app/lib/content-store";
import { resetContent } from "@/app/admin/actions";
import { SettingsForm } from "./form";

export const metadata: Metadata = { title: "Settings" };

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

            <div className="mt-8">
                <SettingsForm studio={studio} />
            </div>

            {/* Destructive, so it is separated and labelled plainly. */}
            <section className="mt-8 rounded-xl border border-line p-6">
                <h2 className="text-base font-extrabold tracking-tight">Reset content</h2>
                <p className="mt-2 text-sm leading-relaxed text-fg-muted">
                    Discards every override and returns the site to the values written in
                    the source files. This clears your saved prices, stock flags, product
                    copy and work list. Uploaded image files are left on disk. It cannot be
                    undone.
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
