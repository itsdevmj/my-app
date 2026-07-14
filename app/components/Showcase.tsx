"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { PORTFOLIO } from "./site-data";

export default function Showcase() {
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    // horizontal travel across the pinned viewport
    const x = useTransform(scrollYProgress, [0, 1], ["2%", "-72%"]);

    return (
        <section id="work" className="relative bg-background">
            <div ref={ref} className="h-[320vh]">
                <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
                    <div className="mb-10 flex items-end justify-between px-5 sm:px-8">
                        <div>
                            <p className="eyebrow mb-3">Selected work</p>
                            <h2 className="display text-5xl sm:text-7xl">
                                Recent <span className="stroke">projects</span>
                            </h2>
                        </div>
                        <span className="eyebrow hidden sm:block">Drag · Scroll →</span>
                    </div>

                    <motion.div style={{ x }} className="flex gap-6 px-5 sm:px-8">
                        {PORTFOLIO.map((p, i) => (
                            <article
                                key={p.title}
                                data-cursor
                                className="group relative h-[62vh] w-[80vw] shrink-0 overflow-hidden rounded-3xl border border-line sm:w-[46vw] lg:w-[34vw]"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={p.image}
                                    alt={p.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                                <span className="absolute left-6 top-6 flex h-10 w-10 items-center justify-center rounded-full border border-foreground/30 text-sm font-semibold backdrop-blur-sm">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-7">
                                    <div>
                                        <span className="eyebrow text-accent">{p.client}</span>
                                        <h3 className="display mt-1 text-3xl sm:text-4xl">{p.title}</h3>
                                    </div>
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent text-ink transition-transform duration-500 group-hover:rotate-45">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                                            <path d="M7 17L17 7M17 7H8M17 7V16" />
                                        </svg>
                                    </span>
                                </div>
                            </article>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
