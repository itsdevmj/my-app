import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getShots } from "@/app/lib/content-store";
import { ARCHIVE_CATEGORIES } from "@/app/lib/site";
import { uploadBackend } from "@/app/lib/uploads";
import { bulkDeleteArchiveShots } from "@/app/admin/actions";
import {
    BulkActionsBar,
    BulkSelection,
    SelectAllCheckbox,
    SelectionCheckbox,
} from "@/app/admin/bulk-selection";
import { ArchiveActionToast, ArchiveUploadForm, DeleteArchiveButton } from "./controls";

export const metadata: Metadata = { title: "Archive" };

type PageProps = { searchParams: Promise<{ kind?: string; toast?: string }> };

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="panel rounded-lg px-4 py-3">
            <p className="text-[11px] uppercase tracking-wider text-fg-dim">{label}</p>
            <p className="mt-1 text-xl font-extrabold tracking-tight">{value}</p>
        </div>
    );
}

export default async function AdminArchivePage({ searchParams }: PageProps) {
    const [shots, params] = await Promise.all([getShots(), searchParams]);
    const categories = ARCHIVE_CATEGORIES.filter((category) => category !== "All");

    return (
        <div className="mx-auto max-w-6xl">
            <ArchiveActionToast
                message={params.toast}
                kind={params.kind === "error" ? "error" : "success"}
            />

            <header className="flex flex-wrap items-end justify-between gap-5">
                <div>
                    <h1 className="h-section text-3xl sm:text-4xl">Archive</h1>
                    <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                        Add and curate the stills shown on the public archive page.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg-dim">
                        Images: {uploadBackend()}
                    </span>
                    <Link
                        href="/archive"
                        className="rounded-full border border-line-strong px-4 py-2 text-xs font-bold tracking-tight text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                        View archive ↗
                    </Link>
                </div>
            </header>

            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Stat label="Total stills" value={String(shots.length)} />
                {categories.slice(0, 3).map((category) => (
                    <Stat
                        key={category}
                        label={category}
                        value={String(shots.filter((shot) => shot.category === category).length)}
                    />
                ))}
            </div>

            <section className="panel mt-6 rounded-lg p-5 sm:p-6">
                <div>
                    <h2 className="text-base font-extrabold tracking-tight">Upload a still</h2>
                    <p className="mt-1 text-xs leading-relaxed text-fg-dim">
                        Uploads use Cloudinary when configured, with local storage as a development fallback.
                    </p>
                </div>
                <ArchiveUploadForm />
            </section>

            <BulkSelection
                action={bulkDeleteArchiveShots}
                ids={shots.map((shot) => shot.id)}
                noun="image(s)"
            >
            <section className="mt-10">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h2 className="text-base font-extrabold tracking-tight">Current archive</h2>
                        <p className="mt-1 text-xs text-fg-dim">Delete entries you no longer want public.</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-fg-dim">
                        <SelectAllCheckbox />
                        <span>Select all · {shots.length} images</span>
                    </div>
                </div>

                <BulkActionsBar />

                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {shots.map((shot) => (
                        <li key={shot.id} className="panel relative overflow-hidden rounded-lg">
                            <SelectionCheckbox
                                id={shot.id}
                                label={`Select ${shot.title}`}
                                className="absolute left-3 top-3 z-10 shadow-lg"
                            />
                            <div className="media relative aspect-[4/3] rounded-none border-0">
                                <Image
                                    src={shot.image}
                                    alt={shot.title}
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover"
                                />
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-extrabold tracking-tight">{shot.title}</p>
                                        <p className="mt-1 truncate text-xs text-fg-dim">
                                            {shot.project || "Untitled project"} · {shot.category}
                                        </p>
                                    </div>
                                    <span className="shrink-0 text-[11px] text-fg-dim">{shot.ratio}</span>
                                </div>
                                <div className="mt-3 flex justify-end">
                                    <DeleteArchiveButton id={shot.id} title={shot.title} />
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
            </BulkSelection>
        </div>
    );
}
