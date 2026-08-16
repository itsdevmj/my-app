"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { deleteProduct } from "@/app/admin/actions";
import { ActionPending, useToast } from "@/app/components/toaster";

export function ShopActionToast({
    message,
    kind,
}: {
    message?: string;
    kind: "success" | "error";
}) {
    const { push } = useToast();

    useEffect(() => {
        if (!message) return;
        push({ kind, message });
        window.history.replaceState(null, "", "/admin/shop");
    }, [kind, message, push]);

    return null;
}

function DeleteSubmit() {
    const { pending } = useFormStatus();
    return (
        <>
            <ActionPending label="Deleting product" />
            <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
            >
                {pending ? "Deleting…" : "Delete product"}
            </button>
        </>
    );
}

export function DeleteProductButton({ handle, name }: { handle: string; name: string }) {
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
                            aria-label="Cancel product deletion"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
                        />
                        <motion.div
                            role="dialog"
                            aria-modal="true"
                            aria-labelledby={`delete-${handle}`}
                            initial={{ opacity: 0, y: 14, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.97 }}
                            className="panel relative w-full max-w-md rounded-lg p-6"
                        >
                            <p className="text-xs font-bold uppercase tracking-wider text-red-300">
                                Delete product
                            </p>
                            <h2 id={`delete-${handle}`} className="mt-2 text-xl font-extrabold tracking-tight">
                                Remove {name}?
                            </h2>
                            <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                                It will disappear from the storefront immediately. Managed images
                                that are not used anywhere else will also be deleted.
                            </p>
                            <form action={deleteProduct} className="mt-6 flex justify-end gap-3">
                                <input type="hidden" name="handle" value={handle} />
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
