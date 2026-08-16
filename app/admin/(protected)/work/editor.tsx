"use client";

import { useActionState } from "react";
import {
    createProject,
    deleteProject,
    reorderProject,
    saveProject,
    type ActionState,
} from "@/app/admin/actions";
import {
    Field,
    ImagePicker,
    MiniButton,
    Result,
    Submit,
    inputClass,
} from "@/app/admin/ui";
import type { StoredProject } from "@/app/lib/content-store";
import { SelectionCheckbox } from "@/app/admin/bulk-selection";

const INITIAL: ActionState = {};

/* ---------------------------------------------------------------------------
   One project card. Each row is its own form, so saving, deleting and
   reordering are independent and report their own result.
------------------------------------------------------------------------- */

export function ProjectCard({
    project,
    index,
    total,
}: {
    project: StoredProject;
    index: number;
    total: number;
}) {
    const [state, formAction] = useActionState(saveProject, INITIAL);
    const isHero = index === 0;

    return (
        <li className="panel rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                    <SelectionCheckbox
                        id={project.id}
                        label={`Select ${project.title}`}
                    />
                    <span className="text-xs font-bold tracking-tight">
                        {String(index + 1).padStart(2, "0")}
                    </span>
                    {isHero ? (
                        <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-extrabold tracking-tight text-accent-fg">
                            Hero card
                        </span>
                    ) : (
                        <span className="rounded-full border border-line-strong px-2.5 py-1 text-[11px] font-semibold text-fg-dim">
                            Grid card
                        </span>
                    )}
                </div>

                {/* reorder + delete, each a tiny independent form */}
                <div className="flex items-center gap-2">
                    <form action={reorderProject}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="-1" />
                        <MiniButton title="Move up" disabled={index === 0}>
                            ↑
                        </MiniButton>
                    </form>
                    <form action={reorderProject}>
                        <input type="hidden" name="id" value={project.id} />
                        <input type="hidden" name="direction" value="1" />
                        <MiniButton title="Move down" disabled={index === total - 1}>
                            ↓
                        </MiniButton>
                    </form>
                    <form action={deleteProject}>
                        <input type="hidden" name="id" value={project.id} />
                        <MiniButton title={`Delete ${project.title}`} danger>
                            ✕
                        </MiniButton>
                    </form>
                </div>
            </div>

            <form action={formAction} className="mt-5">
                <input type="hidden" name="id" value={project.id} />

                <ImagePicker current={project.image} />

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Title">
                        <input
                            name="title"
                            defaultValue={project.title}
                            maxLength={60}
                            required
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Client">
                        <input
                            name="client"
                            defaultValue={project.client}
                            maxLength={60}
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Tag">
                        <input
                            name="tag"
                            defaultValue={project.tag}
                            maxLength={40}
                            placeholder="Brand film"
                            className={inputClass}
                        />
                    </Field>
                    <Field label="Year">
                        <input
                            name="year"
                            defaultValue={project.year}
                            maxLength={4}
                            placeholder="2026"
                            className={inputClass}
                        />
                    </Field>
                </div>

                <div className="mt-5 flex items-center gap-4">
                    <Submit />
                    <Result state={state} />
                </div>
            </form>
        </li>
    );
}

/* ---------------------------------------------------------------------------
   Add a project.
------------------------------------------------------------------------- */

export function AddProject() {
    const [state, formAction] = useActionState(createProject, INITIAL);

    return (
        <form action={formAction} className="rounded-xl border border-dashed border-line-strong p-5">
            <p className="text-sm font-extrabold tracking-tight">Add a project</p>
            <p className="mt-1 text-xs text-fg-dim">
                It joins the end of the list. Move it to the top to make it the hero.
            </p>

            <div className="mt-5">
                <ImagePicker label="Image" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <Field label="Title">
                    <input name="title" maxLength={60} required className={inputClass} />
                </Field>
                <Field label="Client">
                    <input name="client" maxLength={60} className={inputClass} />
                </Field>
                <Field label="Tag">
                    <input name="tag" maxLength={40} placeholder="Brand film" className={inputClass} />
                </Field>
                <Field label="Year">
                    <input name="year" maxLength={4} placeholder="2026" className={inputClass} />
                </Field>
            </div>

            <div className="mt-5 flex items-center gap-4">
                <Submit>Add project</Submit>
                <Result state={state} />
            </div>
        </form>
    );
}
