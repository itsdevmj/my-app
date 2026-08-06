"use client";

/* ===========================================================================
   ARCHIVE — the full stills library
   ---------------------------------------------------------------------------
   Masonry via CSS columns, so tiles keep their natural aspect ratios and the
   grid stays ragged instead of locking to a uniform row height. Column count
   steps 2 → 3 → 4 across breakpoints; two on phones rather than one, so the
   page reads as an archive on a small screen too.

   Clicking a tile opens a lightbox with keyboard navigation (← → Esc).
   ========================================================================= */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ARCHIVE,
    ARCHIVE_CATEGORIES,
    img,
    type ArchiveCategory,
} from "@/app/lib/site";
import { ButtonPrimary, EASE, Rise, Shell } from "@/app/components/site-ui";

export default function ArchivePage() {
    const [filter, setFilter] = useState<ArchiveCategory>("All");
    const [openAt, setOpenAt] = useState<number | null>(null);
    const reduce = useReducedMotion();

    const shots = useMemo(
        () => (filter === "All" ? ARCHIVE : ARCHIVE.filter((s) => s.category === filter)),
        [filter],
    );

    const close = useCallback(() => setOpenAt(null), []);
    const step = useCallback(
        (delta: number) =>
            setOpenAt((i) => (i === null ? i : (i + delta + shots.length) % shots.length)),
        [shots.length],
    );

    /* Keyboard control + scroll lock while the lightbox is up. */
    useEffect(() => {
        if (openAt === null) return;

        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
            if (e.key === "ArrowRight") step(1);
            if (e.key === "ArrowLeft") step(-1);
        };

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);

        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener("keydown", onKey);
        };
    }, [openAt, close, step]);

    const active = openAt === null ? null : shots[openAt];

    return (
        <main className="pb-24 pt-28 sm:pt-36">
            {/* ---- header ---- */}
            <Shell>
                <p className="eyebrow text-fg-dim">
                    <span className="text-accent">Archive</span> · {ARCHIVE.length} stills
                </p>
                <h1 className="h-display mt-5 max-w-3xl text-[clamp(2.25rem,6vw,4rem)]">
                    Every frame we kept
                </h1>
                <p className="lede mt-5 max-w-xl">
                    Stills pulled from sixteen years of shoots — on location, on set and
                    in the grade suite. Tap any frame to open it full size.
                </p>

                {/* ---- filters ---- */}
                <div
                    role="group"
                    aria-label="Filter by category"
                    className="mt-10 flex flex-wrap gap-2 border-t border-line pt-8"
                >
                    {ARCHIVE_CATEGORIES.map((category) => {
                        const on = filter === category;
                        const count =
                            category === "All"
                                ? ARCHIVE.length
                                : ARCHIVE.filter((s) => s.category === category).length;
                        return (
                            <button
                                key={category}
                                type="button"
                                onClick={() => {
                                    setFilter(category);
                                    setOpenAt(null);
                                }}
                                aria-pressed={on}
                                className={`rounded-full border px-4 py-2 text-sm font-semibold tracking-tight transition-colors duration-200 ${on
                                    ? "border-accent bg-accent text-accent-fg"
                                    : "border-line-strong text-fg-muted hover:border-accent hover:text-accent"
                                    }`}
                            >
                                {category}
                                <span className={`ml-2 text-xs ${on ? "text-accent-fg/60" : "text-fg-dim"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </Shell>

            {/* ---- masonry ---- */}
            <Shell className="mt-10 sm:mt-12">
                <div className="columns-2 gap-3 sm:gap-4 md:columns-3 xl:columns-4">
                    {shots.map((shot, i) => (
                        <button
                            key={shot.id}
                            type="button"
                            onClick={() => setOpenAt(i)}
                            aria-label={`Open ${shot.title} — ${shot.project}`}
                            className="group mb-3 block w-full break-inside-avoid text-left sm:mb-4"
                        >
                            <div
                                className="media relative w-full rounded-lg"
                                style={{ aspectRatio: shot.ratio }}
                            >
                                <Image
                                    src={img(shot.id, "sm")}
                                    alt={`${shot.title} — ${shot.project}`}
                                    fill
                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                    className="media-zoom object-cover"
                                />
                                {/* falloff so the caption stays legible over any frame */}
                                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100" />
                            </div>

                            <div className="mt-2 flex items-baseline justify-between gap-2">
                                <span className="truncate text-[13px] font-semibold tracking-tight text-fg-muted transition-colors duration-200 group-hover:text-fg">
                                    {shot.title}
                                </span>
                                <span className="hidden shrink-0 text-[11px] text-fg-dim sm:block">
                                    {shot.category}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {shots.length === 0 && (
                    <p className="py-16 text-center text-fg-dim">Nothing in this category yet.</p>
                )}
            </Shell>

            {/* ---- closing CTA ---- */}
            <Shell className="mt-20">
                <Rise>
                    <div className="panel flex flex-col items-start justify-between gap-6 rounded-xl p-8 sm:flex-row sm:items-center sm:p-10">
                        <div>
                            <h2 className="h-section text-2xl sm:text-3xl">
                                Want the moving version?
                            </h2>
                            <p className="mt-2 max-w-md text-sm leading-relaxed text-fg-muted">
                                Most of these came from film shoots. Tell us what you need and
                                we&apos;ll send the relevant reels.
                            </p>
                        </div>
                        <ButtonPrimary href="/#contact" className="shrink-0">
                            Start a project
                            <span aria-hidden>→</span>
                        </ButtonPrimary>
                    </div>
                </Rise>
            </Shell>

            {/* ---- lightbox ---- */}
            <AnimatePresence>
                {active && (
                    <motion.div
                        key="lightbox"
                        role="dialog"
                        aria-modal="true"
                        aria-label={`${active.title} — ${active.project}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={close}
                        className="fixed inset-0 z-[60] flex flex-col bg-bg/95 backdrop-blur-md"
                    >
                        {/* top bar */}
                        <div
                            className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold tracking-tight">{active.title}</p>
                                <p className="truncate text-xs text-fg-dim">
                                    {active.project} · {active.category}
                                </p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                                <span className="text-xs text-fg-dim">
                                    {openAt! + 1} / {shots.length}
                                </span>
                                <button
                                    type="button"
                                    onClick={close}
                                    autoFocus
                                    aria-label="Close"
                                    className="grid size-10 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent"
                                >
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                        <path d="M6 6l12 12M18 6L6 18" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* frame */}
                        <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-3 sm:px-6 sm:pb-6">
                            <motion.div
                                key={active.id}
                                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.28, ease: EASE }}
                                onClick={(e) => e.stopPropagation()}
                                className="relative h-full w-full"
                            >
                                <Image
                                    src={img(active.id, "lg")}
                                    alt={`${active.title} — ${active.project}`}
                                    fill
                                    sizes="100vw"
                                    className="object-contain"
                                    priority
                                />
                            </motion.div>
                        </div>

                        {/* controls — thumb-reachable on mobile */}
                        <div
                            className="flex items-center justify-center gap-3 px-4 pb-6 sm:pb-8"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                type="button"
                                onClick={() => step(-1)}
                                aria-label="Previous image"
                                className="grid size-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M19 12H5M5 12l6-6M5 12l6 6" />
                                </svg>
                            </button>
                            <button
                                type="button"
                                onClick={() => step(1)}
                                aria-label="Next image"
                                className="grid size-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M5 12h14M19 12l-6-6M19 12l-6 6" />
                                </svg>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
