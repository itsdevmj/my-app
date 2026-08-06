import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getShots } from "@/app/lib/content-store";
import { ARCHIVE_CATEGORIES, img } from "@/app/lib/site";

export const metadata: Metadata = { title: "Archive" };

export default async function AdminArchivePage() {
    const shots = await getShots();

    const counts = ARCHIVE_CATEGORIES.filter((c) => c !== "All").map((category) => ({
        category,
        count: shots.filter((s) => s.category === category).length,
    }));

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Archive</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    {shots.length} stills, shown on the{" "}
                    <Link href="/archive" className="text-accent underline underline-offset-4">
                        archive page
                    </Link>{" "}
                    and in the homepage marquee.
                </p>
            </header>

            <div className="mt-8 flex flex-wrap gap-2">
                {counts.map(({ category, count }) => (
                    <span
                        key={category}
                        className="rounded-full border border-line-strong px-3.5 py-1.5 text-xs font-semibold text-fg-muted"
                    >
                        {category}
                        <span className="ml-2 text-fg-dim">{count}</span>
                    </span>
                ))}
            </div>

            {/* Read-only, and said so plainly rather than showing dead controls. */}
            <div className="mt-6 rounded-lg border border-line p-4">
                <p className="text-sm font-bold tracking-tight">Read-only for now</p>
                <p className="mt-2 text-xs leading-relaxed text-fg-muted">
                    Adding stills means uploading and storing files, which needs blob
                    storage (S3, R2, Vercel Blob) and a database — neither is wired up yet.
                    Until then the list lives in <code>app/lib/site.ts</code>. I left this
                    screen read-only instead of giving you buttons that do nothing.
                </p>
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {shots.map((shot) => (
                    <li key={shot.id} className="panel overflow-hidden rounded-xl">
                        <div className="media relative aspect-[4/3] rounded-none border-0">
                            <Image
                                src={img(shot.id, "sm")}
                                alt={shot.title}
                                fill
                                sizes="(max-width: 640px) 50vw, 25vw"
                                className="object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <p className="truncate text-xs font-semibold">{shot.title}</p>
                            <p className="mt-1 truncate text-[11px] text-fg-dim">
                                {shot.project} · {shot.category}
                            </p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
