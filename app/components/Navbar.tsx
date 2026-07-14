"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Magnetic from "./Magnetic";

const LINKS = [
    { label: "Work", href: "#work" },
    { label: "Studio", href: "#about" },
    { label: "Services", href: "#services" },
    { label: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 30);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <motion.header
            initial={{ y: -70, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 2.4, ease: [0.22, 1, 0.36, 1] }}
            className={`fixed inset-x-0 top-0 z-[9990] transition-all duration-500 ${scrolled ? "bg-background/70 py-3 backdrop-blur-xl" : "py-6"
                }`}
        >
            <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 sm:px-8">
                <a href="#top" className="group flex items-center gap-2.5" data-cursor>
                    <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-accent">
                        <span className="display text-lg leading-none text-ink">C</span>
                    </span>
                    <span className="text-sm font-semibold uppercase tracking-[0.2em]">
                        Capture<span className="text-accent">/</span>Studio
                    </span>
                </a>

                <ul className="hidden items-center gap-2 lg:flex">
                    {LINKS.map((l) => (
                        <li key={l.href}>
                            <a
                                href={l.href}
                                data-cursor
                                className="group relative block px-4 py-2 text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                            >
                                <span className="relative z-10">{l.label}</span>
                                <span className="absolute inset-0 -z-0 scale-0 rounded-full bg-foreground/5 transition-transform duration-300 group-hover:scale-100" />
                            </a>
                        </li>
                    ))}
                </ul>

                <Magnetic className="hidden lg:block">
                    <a
                        href="#contact"
                        data-cursor
                        className="inline-block rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-ink"
                    >
                        Start a project
                    </a>
                </Magnetic>

                <button
                    aria-label="Toggle menu"
                    onClick={() => setOpen((v) => !v)}
                    className="flex flex-col gap-1.5 lg:hidden"
                >
                    <span className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
                    <span className={`h-0.5 w-6 bg-foreground transition-opacity ${open ? "opacity-0" : ""}`} />
                    <span className={`h-0.5 w-6 bg-foreground transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
                </button>
            </nav>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden border-t border-line bg-background/95 backdrop-blur-xl lg:hidden"
                    >
                        <ul className="flex flex-col gap-1 px-5 py-4">
                            {LINKS.map((l) => (
                                <li key={l.href}>
                                    <a href={l.href} onClick={() => setOpen(false)} className="block py-2.5 text-lg text-foreground/80">
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                            <a href="#contact" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-accent px-5 py-3 text-center font-semibold text-ink">
                                Start a project
                            </a>
                        </ul>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
