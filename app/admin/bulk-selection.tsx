"use client";

import { AnimatePresence, motion } from "motion/react";
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { ActionPending } from "@/app/components/toaster";

type BulkAction = (formData: FormData) => void | Promise<void>;

type SelectionContextValue = {
    allSelected: boolean;
    action: BulkAction;
    clear: () => void;
    ids: readonly string[];
    noun: string;
    openDelete: () => void;
    selected: ReadonlySet<string>;
    toggle: (id: string) => void;
    toggleAll: () => void;
};

const SelectionContext = createContext<SelectionContextValue | null>(null);

function useSelection() {
    const context = useContext(SelectionContext);
    if (!context) throw new Error("Selection controls must be inside BulkSelection");
    return context;
}

export function BulkSelection({
    action,
    children,
    ids,
    noun,
}: {
    action: BulkAction;
    children: ReactNode;
    ids: readonly string[];
    noun: string;
}) {
    const [stored, setStored] = useState<Set<string>>(() => new Set());
    const [confirming, setConfirming] = useState(false);
    const available = useMemo(() => new Set(ids), [ids]);
    const selected = useMemo(
        () => new Set([...stored].filter((id) => available.has(id))),
        [available, stored],
    );
    const allSelected = ids.length > 0 && selected.size === ids.length;

    const value = useMemo<SelectionContextValue>(
        () => ({
            allSelected,
            action,
            clear: () => setStored(new Set()),
            ids,
            noun,
            openDelete: () => setConfirming(true),
            selected,
            toggle: (id) =>
                setStored((current) => {
                    const next = new Set(current);
                    if (next.has(id)) next.delete(id);
                    else next.add(id);
                    return next;
                }),
            toggleAll: () => setStored(allSelected ? new Set() : new Set(ids)),
        }),
        [action, allSelected, ids, noun, selected],
    );

    return (
        <SelectionContext.Provider value={value}>
            {children}
            <AnimatePresence>
                {confirming && (
                    <BulkDeleteDialog onClose={() => setConfirming(false)} />
                )}
            </AnimatePresence>
        </SelectionContext.Provider>
    );
}

export function SelectionCheckbox({
    id,
    label,
    className = "",
}: {
    id: string;
    label: string;
    className?: string;
}) {
    const { selected, toggle } = useSelection();
    return (
        <label className={`grid size-9 shrink-0 cursor-pointer place-items-center rounded-md border border-line-strong bg-surface/90 ${className}`}>
            <span className="sr-only">{label}</span>
            <input
                type="checkbox"
                checked={selected.has(id)}
                onChange={() => toggle(id)}
                className="size-4 accent-accent"
            />
        </label>
    );
}

export function SelectAllCheckbox() {
    const { allSelected, ids, selected, toggleAll } = useSelection();
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = selected.size > 0 && !allSelected;
        }
    }, [allSelected, selected.size]);

    return (
        <label className="inline-grid size-8 cursor-pointer place-items-center">
            <span className="sr-only">Select all items</span>
            <input
                ref={ref}
                type="checkbox"
                checked={allSelected}
                disabled={ids.length === 0}
                onChange={toggleAll}
                className="size-4 accent-accent"
            />
        </label>
    );
}

export function BulkActionsBar() {
    const { clear, noun, openDelete, selected } = useSelection();

    return (
        <AnimatePresence initial={false}>
            {selected.size > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="sticky top-16 z-20 mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/40 bg-surface/95 px-4 py-3 shadow-xl backdrop-blur-xl lg:top-4"
                >
                    <p className="text-sm font-bold tracking-tight">
                        {selected.size} {noun} selected
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={clear}
                            className="rounded-md px-3 py-2 text-xs font-bold text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={openDelete}
                            className="rounded-md bg-red-500 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-400"
                        >
                            Delete selected
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

function BulkDeleteSubmit() {
    const { pending } = useFormStatus();
    return (
        <>
            <ActionPending label="Deleting selected items" />
            <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-red-400 disabled:opacity-60"
            >
                {pending ? "Deleting…" : "Delete selected"}
            </button>
        </>
    );
}

function BulkDeleteDialog({ onClose }: { onClose: () => void }) {
    const { action, noun, selected } = useSelection();

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-[110] grid place-items-center px-5">
            <motion.button
                type="button"
                aria-label="Cancel bulk deletion"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-bg/85 backdrop-blur-sm"
            />
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="bulk-delete-title"
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                className="panel relative w-full max-w-md rounded-lg p-6"
            >
                <p className="text-xs font-bold uppercase tracking-wider text-red-300">Bulk delete</p>
                <h2 id="bulk-delete-title" className="mt-2 text-xl font-extrabold tracking-tight">
                    Delete {selected.size} {noun}?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    This removes every selected item and any managed images that are no longer used elsewhere.
                </p>
                <form action={action} className="mt-6 flex justify-end gap-3">
                    {[...selected].map((id) => (
                        <input key={id} type="hidden" name="ids" value={id} />
                    ))}
                    <button
                        type="button"
                        autoFocus
                        onClick={onClose}
                        className="rounded-md border border-line-strong px-4 py-2.5 text-sm font-bold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                        Cancel
                    </button>
                    <BulkDeleteSubmit />
                </form>
            </motion.div>
        </div>
    );
}
