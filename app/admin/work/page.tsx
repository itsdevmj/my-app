import type { Metadata } from "next";
import { getProjects } from "@/app/lib/content-store";
import { updateProjects } from "../actions";

export const metadata: Metadata = { title: "Work" };

/** One spare blank row so a new project can be added without extra UI. */
const BLANK = { title: "", client: "", tag: "", year: "", image: "" };

export default async function AdminWorkPage() {
    const projects = await getProjects();
    const rows = [...projects, BLANK];

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Featured work</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    These are the projects on the homepage. The first row renders as the
                    large hero card. Clear a title to delete that row, or fill in the blank
                    row at the bottom to add one.
                </p>
            </header>

            <form action={updateProjects} className="mt-8">
                <ul className="space-y-4">
                    {rows.map((project, i) => (
                        <li key={`${project.title}-${i}`} className="panel rounded-xl p-5">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-xs uppercase tracking-wider text-fg-dim">
                                    {i === 0 ? "Hero card" : `Row ${i + 1}`}
                                </p>
                                {i === rows.length - 1 && (
                                    <p className="text-xs text-accent">New — leave blank to skip</p>
                                )}
                            </div>

                            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Title
                                    </span>
                                    <input
                                        name="title"
                                        defaultValue={project.title}
                                        maxLength={60}
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Client
                                    </span>
                                    <input
                                        name="client"
                                        defaultValue={project.client}
                                        maxLength={60}
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Tag
                                    </span>
                                    <input
                                        name="tag"
                                        defaultValue={project.tag}
                                        maxLength={40}
                                        placeholder="Brand film"
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-dim focus:border-accent"
                                    />
                                </label>

                                <label className="block">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Year
                                    </span>
                                    <input
                                        name="year"
                                        defaultValue={project.year}
                                        maxLength={4}
                                        placeholder="2026"
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-dim focus:border-accent"
                                    />
                                </label>

                                <label className="block sm:col-span-2 lg:col-span-4">
                                    <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                                        Image URL
                                    </span>
                                    <input
                                        name="image"
                                        defaultValue={project.image}
                                        className="mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 font-mono text-xs outline-none focus:border-accent"
                                    />
                                    <span className="mt-1.5 block text-[11px] leading-relaxed text-fg-dim">
                                        Must be an allowed host. Unsplash URLs need to match one of the
                                        two query strings in <code>next.config.ts</code>, otherwise
                                        next/image will reject them.
                                    </span>
                                </label>
                            </div>
                        </li>
                    ))}
                </ul>

                <button
                    type="submit"
                    className="mt-6 rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.02]"
                >
                    Save work
                </button>
            </form>
        </div>
    );
}
