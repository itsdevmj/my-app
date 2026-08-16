"use client";

/* ===========================================================================
   Admin form building blocks.
   ========================================================================= */

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "./actions";
import { ActionPending, useToast } from "@/app/components/toaster";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Submit button that reflects the enclosing form's pending state. */
export function Submit({
    children = "Save",
    className = "",
    loadingLabel = "Saving changes",
}: {
    children?: ReactNode;
    className?: string;
    loadingLabel?: string;
}) {
    const { pending } = useFormStatus();
    return (
        <>
            <ActionPending label={loadingLabel} />
            <button
                type="submit"
                disabled={pending}
                className={`rounded-full bg-accent px-5 py-2.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 enabled:hover:scale-[1.03] disabled:opacity-60 ${className}`}
            >
                {pending ? "Saving…" : children}
            </button>
        </>
    );
}

/** Small icon-ish button for reorder/delete rows. */
export function MiniButton({
    children,
    title,
    danger = false,
    disabled = false,
}: {
    children: ReactNode;
    title: string;
    danger?: boolean;
    disabled?: boolean;
}) {
    const { pending } = useFormStatus();
    return (
        <>
            <ActionPending label={title} />
            <button
                type="submit"
                title={title}
                aria-label={title}
                disabled={disabled || pending}
                className={`grid size-9 place-items-center rounded-lg border text-sm transition-colors disabled:opacity-30 ${danger
                        ? "border-line-strong text-fg-dim hover:border-accent hover:text-accent"
                        : "border-line-strong text-fg-muted hover:border-accent hover:text-accent"
                    }`}
            >
                {children}
            </button>
        </>
    );
}

/** Inline result banner, driven by an action's returned state. */
export function Result({ state }: { state: ActionState }) {
    const message = state.error ?? state.ok;
    const { push } = useToast();

    useEffect(() => {
        if (!message) return;
        push({
            announce: false,
            kind: state.error ? "error" : "success",
            message,
        });
    }, [message, push, state]);

    return (
        <AnimatePresence mode="wait">
            {message && (
                <motion.p
                    key={message}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    role={state.error ? "alert" : "status"}
                    className={`text-xs font-semibold ${state.error ? "text-accent" : "text-fg-muted"
                        }`}
                >
                    {message}
                </motion.p>
            )}
        </AnimatePresence>
    );
}

export function Field({
    label,
    hint,
    children,
    className = "",
}: {
    label: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label className={`block ${className}`}>
            <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                {label}
            </span>
            {children}
            {hint && (
                <span className="mt-1.5 block text-[11px] leading-relaxed text-fg-dim">
                    {hint}
                </span>
            )}
        </label>
    );
}

export const inputClass =
    "mt-1.5 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none transition-colors focus:border-accent";

/* ---------------------------------------------------------------------------
   IMAGE PICKER
------------------------------------------------------------------------- */

/**
 * File input with a live preview of the chosen image, falling back to whatever
 * is currently saved. Also exposes a URL field, so remote images still work.
 * The preview is a local object URL — it never uploads until the form submits.
 */
export function ImagePicker({
    current,
    name = "file",
    urlName = "imageUrl",
    allowUrl = true,
    label = "Image",
}: {
    current?: string;
    name?: string;
    urlName?: string;
    allowUrl?: boolean;
    label?: string;
}) {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const shown = preview ?? current;

    return (
        <div>
            <span className="block text-[11px] uppercase tracking-wider text-fg-dim">
                {label}
            </span>

            <div className="mt-2 flex gap-4">
                {/* preview */}
                <div className="media relative size-24 shrink-0 overflow-hidden rounded-lg">
                    {shown ? (
                        /* Plain <img>: the source is either a blob: URL from the picker or
                           an arbitrary saved URL, neither of which next/image can size. */
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={shown} alt="" className="size-full object-cover" />
                    ) : (
                        <span className="grid size-full place-items-center text-[11px] text-fg-dim">
                            None
                        </span>
                    )}
                </div>

                <div className="min-w-0 flex-1">
                    <input
                        ref={inputRef}
                        type="file"
                        name={name}
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (preview) URL.revokeObjectURL(preview);
                            setPreview(file ? URL.createObjectURL(file) : null);
                            setFileName(file?.name ?? null);
                        }}
                        className="block w-full text-xs text-fg-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-3 file:px-4 file:py-2 file:text-xs file:font-bold file:text-fg hover:file:bg-accent hover:file:text-accent-fg"
                    />

                    <p className="mt-2 text-[11px] leading-relaxed text-fg-dim">
                        {fileName
                            ? `${fileName} — saves when you submit.`
                            : "JPEG, PNG, WebP or AVIF. Up to 8MB."}
                    </p>

                    {allowUrl && (
                        <input
                            type="url"
                            name={urlName}
                            defaultValue={current ?? ""}
                            placeholder="…or paste an image URL"
                            className="mt-2 w-full rounded-lg border border-line-strong bg-bg px-3 py-2 font-mono text-[11px] outline-none transition-colors focus:border-accent"
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
