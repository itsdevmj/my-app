"use client";

/* ===========================================================================
   Shared UI: layout primitives, buttons, and the site chrome (nav + footer).
   Nav and Footer are rendered from app/layout.tsx so every route gets them.
   ========================================================================= */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { FOOTER_NAV, NAV, STUDIO } from "@/app/lib/site";

export const EASE = [0.16, 1, 0.3, 1] as const;

/* ---------------------------------------------------------------------------
   PRIMITIVES
------------------------------------------------------------------------- */

/** One soft fade-and-rise on entry. Used sparingly, once per block. */
export function Rise({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const reduce = useReducedMotion();
    return (
        <motion.div
            className={className}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, delay, ease: EASE }}
        >
            {children}
        </motion.div>
    );
}

export function Shell({
    children,
    className = "",
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={`mx-auto w-full max-w-7xl px-5 sm:px-8 ${className}`}>
            {children}
        </div>
    );
}

export function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <span className="eyebrow inline-flex items-center gap-2.5 text-fg-dim">
            <span className="size-1.5 rounded-full bg-accent" />
            {children}
        </span>
    );
}

/** Primary pill button. */
export function ButtonPrimary({
    href,
    children,
    className = "",
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 hover:scale-[1.03] active:scale-100 ${className}`}
        >
            {children}
        </Link>
    );
}

/** Secondary, outlined. */
export function ButtonGhost({
    href,
    children,
    className = "",
}: {
    href: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Link
            href={href}
            className={`inline-flex items-center justify-center gap-2.5 rounded-full border border-line-strong px-6 py-3.5 text-sm font-semibold tracking-tight text-fg transition-colors duration-300 hover:border-accent hover:text-accent ${className}`}
        >
            {children}
        </Link>
    );
}

export function SectionHeading({
    eyebrow,
    title,
    body,
    action,
}: {
    eyebrow: string;
    title: ReactNode;
    body?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
                <Eyebrow>{eyebrow}</Eyebrow>
                <h2 className="h-section mt-5 text-4xl sm:text-5xl lg:text-[3.5rem]">
                    {title}
                </h2>
                {body ? <p className="lede mt-5 max-w-xl">{body}</p> : null}
            </div>
            {action ? <div className="shrink-0">{action}</div> : null}
        </div>
    );
}

/* ---------------------------------------------------------------------------
   NAV
------------------------------------------------------------------------- */

export function SiteNav() {
    const [open, setOpen] = useState(false);
    const reduce = useReducedMotion();

    return (
        <header className="fixed inset-x-0 top-0 z-50 pt-3 sm:pt-4">
            <Shell>
                <div className="glass flex items-center justify-between rounded-full py-2.5 pl-5 pr-2.5">
                    <Link href="/" className="flex items-center gap-2.5" aria-label="Capture Studio home">
                        <span className="grid size-7 place-items-center rounded-md bg-accent">
                            <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                        </span>
                        <span className="text-[15px] font-extrabold tracking-tight">Captured</span>
                    </Link>

                    <nav aria-label="Primary" className="hidden lg:block">
                        <ul className="flex items-center gap-1">
                            {NAV.map((item) => (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        className="rounded-full px-4 py-2 text-sm font-semibold text-fg-muted transition-colors duration-200 hover:bg-surface-3 hover:text-fg"
                                    >
                                        {item.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="flex items-center gap-2">
                        <ButtonPrimary href="/#contact" className="hidden px-5 py-2.5 sm:inline-flex">
                            Start a project
                        </ButtonPrimary>
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-expanded={open}
                            aria-label="Toggle menu"
                            className="grid size-10 place-items-center rounded-full border border-line-strong lg:hidden"
                        >
                            <span className="flex flex-col gap-[5px]">
                                <span
                                    className={`h-px w-4 bg-fg transition-transform duration-300 ${open ? "translate-y-[3px] rotate-45" : ""
                                        }`}
                                />
                                <span
                                    className={`h-px w-4 bg-fg transition-transform duration-300 ${open ? "-translate-y-[3px] -rotate-45" : ""
                                        }`}
                                />
                            </span>
                        </button>
                    </div>
                </div>

                {/* Panel springs open by height, then the rows stagger in behind it.
            Children skip their own exit — the height collapse covers it. */}
                <AnimatePresence initial={false}>
                    {open && (
                        <motion.div
                            key="mobile-nav"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{
                                height: { duration: 0.42, ease: EASE },
                                opacity: { duration: 0.22 },
                            }}
                            className="overflow-hidden lg:hidden"
                        >
                            <nav aria-label="Mobile" className="glass mt-2 rounded-xl p-2">
                                <ul>
                                    {NAV.map((item, i) => (
                                        <motion.li
                                            key={item.href}
                                            initial={reduce ? { opacity: 0 } : { opacity: 0, x: -14 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{
                                                delay: 0.07 + i * 0.055,
                                                duration: 0.4,
                                                ease: EASE,
                                            }}
                                        >
                                            <Link
                                                href={item.href}
                                                onClick={() => setOpen(false)}
                                                className="block rounded-lg px-4 py-3 text-base font-semibold text-fg-muted transition-colors hover:bg-surface-3 hover:text-fg"
                                            >
                                                {item.label}
                                            </Link>
                                        </motion.li>
                                    ))}
                                </ul>

                                <motion.div
                                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.07 + NAV.length * 0.055,
                                        duration: 0.4,
                                        ease: EASE,
                                    }}
                                >
                                    <ButtonPrimary href="/#contact" className="mt-1 w-full">
                                        Start a project
                                    </ButtonPrimary>
                                </motion.div>
                            </nav>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Shell>
        </header>
    );
}

/* ---------------------------------------------------------------------------
   FOOTER
------------------------------------------------------------------------- */

export function SiteFooter() {
    return (
        <footer className="border-t border-line pb-10 pt-16">
            <Shell>
                <div className="grid gap-12 lg:grid-cols-[1.5fr_2fr]">
                    <div className="max-w-sm">
                        <Link href="/" className="flex items-center gap-2.5">
                            <span className="grid size-7 place-items-center rounded-md bg-accent">
                                <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                            </span>
                            <span className="text-[15px] font-extrabold tracking-tight">Capture Studio</span>
                        </Link>
                        <p className="mt-5 text-sm leading-relaxed text-fg-dim">
                            A video production and photography company in New York. Brand
                            films, commercials and campaign content since 2011.
                        </p>
                        <p className="mt-6 text-sm text-fg-dim">{STUDIO.address}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
                        {Object.entries(FOOTER_NAV).map(([heading, links]) => (
                            <nav key={heading} aria-label={heading}>
                                <h2 className="text-sm font-extrabold tracking-tight">{heading}</h2>
                                <ul className="mt-4 space-y-2.5">
                                    {links.map((link) => (
                                        <li key={link}>
                                            <Link
                                                href="/#work"
                                                className="text-sm text-fg-dim transition-colors duration-200 hover:text-accent"
                                            >
                                                {link}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>

                <div className="mt-14 flex flex-col gap-3 border-t border-line pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-fg-dim">
                        © {new Date().getFullYear()} {STUDIO.name}. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="/" className="text-sm text-fg-dim transition-colors hover:text-accent">
                            Privacy
                        </Link>
                        <Link href="/" className="text-sm text-fg-dim transition-colors hover:text-accent">
                            Terms
                        </Link>
                    </div>
                </div>
            </Shell>
        </footer>
    );
}
