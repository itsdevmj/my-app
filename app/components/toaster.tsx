"use client";

import { AnimatePresence, motion } from "motion/react";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
} from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

type ToastKind = "success" | "error" | "info";

export type ToastInput = {
    announce?: boolean;
    duration?: number;
    kind?: ToastKind;
    message: string;
};

type Toast = ToastInput & { id: number };

type ToastContextValue = {
    push: (toast: ToastInput) => void;
    dismiss: (id: number) => void;
};

type PendingContextValue = {
    setPending: (id: string, label: string, pending: boolean) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);
const PendingContext = createContext<PendingContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used inside ToasterProvider");
    return context;
}

/** Drop this inside a form to show the shared loading screen while it submits. */
export function ActionPending({ label = "Saving changes" }: { label?: string }) {
    const { pending } = useFormStatus();
    const id = useId();
    const context = useContext(PendingContext);

    useEffect(() => {
        context?.setPending(id, label, pending);
        return () => context?.setPending(id, label, false);
    }, [context, id, label, pending]);

    return null;
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: number) => void }) {
    const duration = toast.duration ?? 5000;

    useEffect(() => {
        const timer = window.setTimeout(() => onDismiss(toast.id), duration);
        return () => window.clearTimeout(timer);
    }, [duration, onDismiss, toast.id]);

    const isError = toast.kind === "error";
    const isSuccess = toast.kind === "success";
    const tone = isError
        ? {
            border: "border-red-400/45",
        }
        : isSuccess
            ? {
                border: "border-emerald-400/70",
            }
            : {
                border: "border-accent/45",
            };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            role={toast.announce === false ? undefined : isError ? "alert" : "status"}
            className={`pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-lg border bg-surface/95 py-3 pl-4 pr-2 shadow-2xl backdrop-blur-xl ${tone.border}`}
        >
            <p
                aria-hidden={toast.announce === false || undefined}
                className="min-w-0 flex-1 text-sm font-semibold leading-snug text-fg"
            >
                {toast.message}
            </p>
            <button
                type="button"
                onClick={() => onDismiss(toast.id)}
                aria-label="Dismiss notification"
                className="grid size-7 shrink-0 place-items-center rounded-md text-lg leading-none text-fg-dim transition-colors hover:bg-surface-3 hover:text-fg"
            >
                <span aria-hidden>×</span>
            </button>
            <motion.span
                aria-hidden
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: duration / 1000, ease: "linear" }}
                className="absolute bottom-0 left-0 h-px bg-fg/25"
            />
        </motion.div>
    );
}

export function ToasterProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const [pending, setPending] = useState<Map<string, string>>(new Map());
    const nextId = useRef(0);

    const dismiss = useCallback((id: number) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const push = useCallback((input: ToastInput) => {
        const message = input.message.trim();
        if (!message) return;
        setToasts((current) => {
            if (current.some((toast) => toast.message === message && toast.kind === input.kind)) {
                return current;
            }
            const toast = { ...input, message, id: nextId.current++ };
            return [...current, toast].slice(-4);
        });
    }, []);

    const setPendingAction = useCallback((id: string, label: string, isPending: boolean) => {
        setPending((current) => {
            const next = new Map(current);
            if (isPending) next.set(id, label);
            else next.delete(id);
            return next;
        });
    }, []);

    const activeLabel = [...pending.values()].at(-1);
    const pendingContext = useMemo(
        () => ({ setPending: setPendingAction }),
        [setPendingAction],
    );

    return (
        <PendingContext.Provider value={pendingContext}>
            <ToastContext.Provider value={{ push, dismiss }}>
                {children}
                <div className="pointer-events-none fixed inset-x-4 top-4 z-[100] flex justify-center sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[min(24rem,calc(100vw-2.5rem))]">
                    <div className="flex w-full flex-col gap-2">
                        <AnimatePresence initial={false} mode="popLayout">
                            {toasts.map((toast) => (
                                <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
                <AnimatePresence>
                    {activeLabel && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-[120] grid place-items-center bg-bg/70 px-5 backdrop-blur-sm"
                            role="status"
                            aria-live="polite"
                            aria-busy="true"
                        >
                            <div className="flex items-center gap-3 rounded-lg border border-line-strong bg-surface px-5 py-4 shadow-2xl">
                                <span aria-hidden className="size-5 animate-spin rounded-full border-2 border-fg-dim border-t-accent" />
                                <p className="text-sm font-bold tracking-tight">{activeLabel}…</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </ToastContext.Provider>
        </PendingContext.Provider>
    );
}
