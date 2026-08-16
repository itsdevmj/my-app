import type { Metadata } from "next";
import Link from "next/link";
import { getProjects } from "@/app/lib/content-store";
import { bulkDeleteProjects } from "@/app/admin/actions";
import { ActionToast } from "@/app/admin/action-toast";
import { BulkActionsBar, BulkSelection, SelectAllCheckbox } from "@/app/admin/bulk-selection";
import { AddProject, ProjectCard } from "./editor";

export const metadata: Metadata = { title: "Work" };

type PageProps = { searchParams: Promise<{ kind?: string; toast?: string }> };

export default async function AdminWorkPage({ searchParams }: PageProps) {
    const [projects, params] = await Promise.all([getProjects(), searchParams]);

    return (
        <div className="mx-auto max-w-4xl">
            <ActionToast
                cleanPath="/admin/work"
                message={params.toast}
                kind={params.kind === "error" ? "error" : "success"}
            />
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Featured work</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    The projects on the{" "}
                    <Link href="/" className="text-accent underline underline-offset-4">
                        homepage
                    </Link>
                    . The first one renders as the large hero card, the rest fill the grid
                    below it. Upload an image or paste a URL — each card saves on its own.
                </p>
            </header>

            <div className="mt-8">
                <AddProject />
            </div>

            <BulkSelection
                action={bulkDeleteProjects}
                ids={projects.map((project) => project.id)}
                noun="project(s)"
            >
                <div className="mt-8 flex items-center gap-2 text-xs font-semibold text-fg-dim">
                    <SelectAllCheckbox />
                    <span>Select all projects</span>
                </div>
                <BulkActionsBar />
                <ul className="mt-4 space-y-4">
                    {projects.map((project, i) => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            index={i}
                            total={projects.length}
                        />
                    ))}
                </ul>
            </BulkSelection>

            {projects.length === 0 && (
                <p className="mt-8 rounded-xl border border-line p-5 text-sm text-fg-dim">
                    No projects yet — the homepage work section will be empty until you add
                    one.
                </p>
            )}

        </div>
    );
}
