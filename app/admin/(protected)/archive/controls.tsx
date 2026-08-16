"use client";

import { AnimatePresence, motion } from "motion/react";
import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import {
    createArchiveShot,
    deleteArchiveShot,
    type ActionState,
} from "@/app/admin/actions";
import { ActionPending, useToast } from "@/app/components/toaster";
import { Field, ImagePicker, Result, Submit, inputClass } from "@/app/admin/ui";

const INITIAL: ActionState = {};

export function ArchiveUploadForm() {
    const [state, formAction] = useActionState(createArchiveShot, INITIAL);
    return (
        <form action={formAction} className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Title">
                    <input name="title" required maxLength={100} className={inputClass} placeholder="Night unit, A-camera" />
                </Field>
                <Field label="Project">
                    <input name="project" maxLength={80} className={inputClass} placeholder="Green Waves" />
                </Field>
                <Field label="Category">
                    <select name="category" defaultValue="On set" className={inputClass}>
                        {['On set', 'Location', 'Portrait', 'Post'].map((category) => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>
                </Field>
                <Field label="Frame ratio">
                    <select name="ratio" defaultValue="3 / 2" className={inputClass}>
                        {['3 / 2', '2 / 3', '1 / 1'].map((ratio) => (
                            <option key={ratio} value={ratio}>{ratio}</option>
                        ))}
                    </select>
                </Field>
            </div>

            <div>
                <ImagePicker label="Image" allowUrl={false} />
                <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Submit>Add to archive</Submit>
                    <Result state={state} />
                </div>
            </div>
        </form>
    );
}

function DeleteSubmit() {
    const { pending } = useFormStatus();
    return (
        <>
            <ActionPending label="Deleting archive image" />
            <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
            >
                {pending ? "Deleting…" : "Delete image"}
            </button>
        </>
    );
}

export function DeleteArchiveButton({ id, title }: { id: string; title: string }) {
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!open) return;
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [open]);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className="rounded-md px-2.5 py-2 text-xs font-bold text-red-300 transition-colors hover:bg-red-400/10 hover:text-red-200"
            >
                Delete
            </button>
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-[110] grid place-items-center px-5">
                        <motion.button
                            type="button"
                            aria-label="Cancel archive deletion"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`delete-archive-${id}`}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.97 }}
                            className="panel relative w-full max-w-md rounded-lg p-6"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-red-300">Delete image</p>
                            <h2 id={`delete-archive-${id}`} className="mt-2 text-xl font-extrabold tracking-tight">
                                Remove {title}?
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                                The image will disappear from the public archive. Unused managed
                                uploads are removed from storage too.
                            </p>
                            <form action={deleteArchiveShot} className="mt-6 flex justify-end gap-3">
                                <input type="hidden" name="id" value={id} />
                                <button
                                    type="button"
                                    autoFocus
                                    onClick={() => setOpen(false)}
                                    className="rounded-md border border-line-strong px-4 py-2.5 text-sm font-bold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                                >
                                    Cancel
                                </button>
                                <DeleteSubmit />
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}

export function ArchiveActionToast({ message, kind }: { message?: string; kind: "success" | "error" }) {
    const { push } = useToast();
    useEffect(() => {
        if (!message) return;
        push({ kind, message });
        window.history.replaceState(null, "", "/admin/archive");
    }, [kind, message, push]);
    return null;
}
