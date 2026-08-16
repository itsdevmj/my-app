"use client";

/* ===========================================================================
   ADMIN SHELL — sidebar on every breakpoint
   ---------------------------------------------------------------------------
   Desktop: a fixed 16rem rail.
   Mobile:  the same rail, off-canvas, sliding in from the left over a scrim.
            A slim bar holds the trigger; the nav never becomes a top strip.

   Motion:
     · The active-item highlight is a single shared element that morphs between
       rows via layoutId, rather than a background that pops on and off.
     · The drawer slides on a spring, and its rows stagger in behind it.
     · Both instances render their own layoutId scope, since the desktop rail
       stays mounted (just hidden) while the drawer is open.
   ========================================================================= */

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logout } from "./actions";

const LINKS = [
    { label: "Overview", href: "/admin" },
    { label: "Work", href: "/admin/work" },
    { label: "Shop", href: "/admin/shop" },
    { label: "Archive", href: "/admin/archive" },
    { label: "Settings", href: "/admin/settings" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

function isActive(pathname: string, href: string) {
    return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

function Wordmark() {
    return (
        <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-md bg-accent">
                <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">Admin</span>
        </Link>
    );
}

/** The rail's contents, shared by the desktop sidebar and the mobile drawer. */
function SidebarBody({
    scope,
    onNavigate,
    stagger = false,
}: {
    scope: string;
    onNavigate?: () => void;
    stagger?: boolean;
}) {
    const pathname = usePathname();
    const reduce = useReducedMotion();

    return (
        <div className="flex h-full flex-col gap-7 p-5">
            <Wordmark />

            <nav aria-label="Admin sections">
                <p className="px-1 pb-2 text-[11px] uppercase tracking-wider text-fg-dim">
                    Manage
                </p>
                <ul className="flex flex-col gap-1">
                    {LINKS.map((link, i) => {
                        const active = isActive(pathname, link.href);
                        return (
                            <motion.li
                                key={link.href}
                                initial={stagger ? { opacity: 0, x: -12 } : false}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.06 + i * 0.05, duration: 0.35, ease: EASE }}
                            >
                                <Link
                                    href={link.href}
                                    onClick={onNavigate}
                                    aria-current={active ? "page" : undefined}
                                    className={`relative block rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${active ? "text-accent-fg" : "text-fg-muted hover:text-fg"
                                        }`}
                                >
                                    {/* the morphing highlight */}
                                    {active && (
                                        <motion.span
                                            layoutId={`${scope}-active`}
                                            aria-hidden
                                            className="absolute inset-0 -z-10 rounded-lg bg-accent"
                                            transition={
                                                reduce
                                                    ? { duration: 0 }
                                                    : { type: "spring", stiffness: 380, damping: 32 }
                                            }
                                        />
                                    )}
                                    {/* hover wash, kept separate so it never fights the highlight */}
                                    {!active && (
                                        <span
                                            aria-hidden
                                            className="absolute inset-0 -z-10 rounded-lg bg-surface-3 opacity-0 transition-opacity duration-200 hover:opacity-100"
                                        />
                                    )}
                                    {link.label}
                                </Link>
                            </motion.li>
                        );
                    })}
                </ul>
            </nav>

            <div className="mt-auto space-y-3">
                <div className="space-y-1.5">
                    <Link
                        href="/"
                        className="block text-xs text-fg-dim transition-colors hover:text-accent"
                    >
                        View site ↗
                    </Link>
                    <Link
                        href="/shop"
                        className="block text-xs text-fg-dim transition-colors hover:text-accent"
                    >
                        View shop ↗
                    </Link>
                </div>

                <form action={logout}>
                    <button
                        type="submit"
                        className="w-full rounded-lg border border-line-strong px-3.5 py-2.5 text-sm font-semibold text-fg-muted transition-colors hover:border-accent hover:text-accent"
                    >
                        Sign out
                    </button>
                </form>
            </div>
        </div>
    );
}

export function AdminShell() {
    const [open, setOpen] = useState(false);
    const reduce = useReducedMotion();

    /* Esc closes, and the page behind the drawer stops scrolling. */
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [open]);

    return (
        <>
            {/* ---- desktop rail ---- */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-line bg-surface lg:block">
                <SidebarBody scope="desktop" />
            </aside>

            {/* ---- mobile trigger bar: just the control, not the nav ---- */}
            <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line bg-surface/90 px-4 backdrop-blur-xl lg:hidden">
                <Wordmark />
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Open admin menu"
                    aria-expanded={open}
                    className="grid size-10 place-items-center rounded-lg border border-line-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
                >
                    <span aria-hidden className="flex flex-col gap-[4px]">
                        <span className="h-px w-4 bg-current" />
                        <span className="h-px w-4 bg-current" />
                        <span className="h-px w-4 bg-current" />
                    </span>
                </button>
            </div>

            {/* ---- mobile drawer ---- */}
            <AnimatePresence>
                {open && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <motion.div
                            key="scrim"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => setOpen(false)}
                            className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
                        />

                        <motion.aside
                            key="drawer"
                            role="dialog"
                            aria-modal="true"
                            aria-label="Admin menu"
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={
                                reduce
                                    ? { duration: 0 }
                                    : { type: "spring", stiffness: 420, damping: 38 }
                            }
                            className="relative h-full w-[17rem] max-w-[85vw] border-r border-line bg-surface"
                        >
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                autoFocus
                                aria-label="Close admin menu"
                                className="absolute right-3 top-4 grid size-9 place-items-center rounded-lg border border-line-strong text-fg-muted transition-colors hover:border-accent hover:text-accent"
                            >
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>

                            {/* Closing on click keeps navigation out of an effect. */}
                            <SidebarBody scope="drawer" stagger onNavigate={() => setOpen(false)} />
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
