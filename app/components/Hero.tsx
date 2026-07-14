"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { HERO_POSTER, VIDEOS } from "./site-data";

const ease = [0.22, 1, 0.36, 1] as const;
// starts after the preloader finishes (~2.2s)
const BASE = 2.3;

const reveal = {
    hidden: { y: "115%" },
    show: (i: number) => ({
        y: "0%",
        transition: { duration: 1, delay: BASE + i * 0.12, ease },
    }),
};

export default function Hero() {
    const ref = useRef<HTMLElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end start"],
    });
    const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
    const scale = useTransform(scrollYProgress, [0, 1], [1, 1.18]);
    const textY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);
    const fade = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

    return (
        <section
            id="top"
            ref={ref}
            className="relative flex h-screen flex-col justify-end overflow-hidden"
        >
            {/* full-bleed background video */}
            <motion.div style={{ y, scale }} className="absolute inset-0 -z-10">
                <video
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    poster={HERO_POSTER}
                >
                    <source src={VIDEOS.hero} type="video/mp4" />
                </video>
                {/* cinematic grading: darker toward the bottom-left where text sits */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
            </motion.div>

            {/* top meta row */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: BASE, duration: 0.6 }}
                className="absolute inset-x-0 top-24 flex items-center justify-between px-5 sm:top-28 sm:px-8"
            >
                <span className="eyebrow flex items-center gap-3">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                    Creative studio — est. 2011
                </span>
                <span className="eyebrow hidden sm:block">Reel 2026 · Vol.01</span>
            </motion.div>

            {/* rotating badge, top-right */}
            <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: BASE + 0.6, duration: 0.8, ease }}
                className="absolute right-5 top-40 hidden sm:right-8 lg:block"
            >
                <div className="relative h-28 w-28">
                    <div className="absolute inset-0 animate-spin-slow">
                        <svg viewBox="0 0 100 100" className="h-full w-full">
                            <defs>
                                <path id="circlePath" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                            </defs>
                            <text className="fill-foreground/70 text-[8.5px] uppercase tracking-[0.32em]">
                                <textPath href="#circlePath">
                                    Videography · Photography · Marketing ·
                                </textPath>
                            </text>
                        </svg>
                    </div>
                    <span className="absolute inset-0 m-auto flex h-11 w-11 items-center justify-center rounded-full bg-accent text-ink">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </span>
                </div>
            </motion.div>

            {/* bottom-left content */}
            <motion.div
                style={{ y: textY, opacity: fade }}
                className="relative mx-auto flex w-full max-w-[1500px] flex-col gap-6 px-5 pb-12 sm:flex-row sm:items-end sm:justify-between sm:px-8 sm:pb-14"
            >
                <div className="max-w-xl">
                    <h1 className="display text-3xl leading-[1.03] sm:text-4xl lg:text-5xl">
                        <span className="block overflow-hidden pb-0.5">
                            <motion.span custom={0} variants={reveal} initial="hidden" animate="show" className="block">
                                Capture the <span className="text-accent">unseen</span>
                            </motion.span>
                        </span>
                    </h1>
                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: BASE + 0.7, duration: 0.8, ease }}
                        className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/70"
                    >
                        We turn brands into cinematic stories — motion, stills and
                        campaigns built to stop the scroll.
                    </motion.p>
                </div>

                <motion.a
                    href="#work"
                    data-cursor
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: BASE + 0.85, duration: 0.8, ease }}
                    className="group flex shrink-0 items-center gap-3 text-xs font-semibold uppercase tracking-widest"
                >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/25 transition-colors group-hover:border-accent">
                        <span className="ml-0.5 h-0 w-0 border-y-[6px] border-l-[9px] border-y-transparent border-l-accent" />
                    </span>
                    Watch showreel
                </motion.a>
            </motion.div>

            {/* bottom scroll cue, right */}
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: BASE + 1.2, duration: 0.6 }}
                className="eyebrow absolute bottom-6 right-5 hidden sm:right-8 lg:block"
            >
                Scroll to explore
            </motion.span>
        </section>
    );
}
