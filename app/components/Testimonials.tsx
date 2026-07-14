"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { TESTIMONIALS } from "./site-data";

export default function Testimonials() {
    const [index, setIndex] = useState(0);
    const [dir, setDir] = useState(1);

    const go = (next: number) => {
        setDir(next > index || (index === TESTIMONIALS.length - 1 && next === 0) ? 1 : -1);
        setIndex((next + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    const t = TESTIMONIALS[index];

    return (
        <section className="border-t border-line bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
                <p className="eyebrow mb-4">Client chronicles</p>
                <h2 className="display mb-12 text-4xl sm:text-5xl">
                    Stories that make us <span className="serif text-accent">smile</span>
                </h2>

                <div className="relative min-h-[220px]">
                    <AnimatePresence mode="wait" custom={dir}>
                        <motion.blockquote
                            key={index}
                            custom={dir}
                            initial={{ opacity: 0, x: dir * 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: dir * -40 }}
                            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                            className="flex flex-col items-center"
                        >
                            <p className="max-w-2xl text-xl leading-relaxed text-foreground/90 sm:text-2xl">
                                “{t.quote}”
                            </p>
                            <footer className="mt-8">
                                <p className="display text-lg">{t.name}</p>
                                <p className="mt-1 text-sm text-foreground/50">{t.role}</p>
                            </footer>
                        </motion.blockquote>
                    </AnimatePresence>
                </div>

                <div className="mt-10 flex items-center justify-center gap-3">
                    <button
                        aria-label="Previous testimonial"
                        onClick={() => go(index - 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent"
                    >
                        <span aria-hidden>←</span>
                    </button>
                    <div className="flex gap-2">
                        {TESTIMONIALS.map((_, i) => (
                            <button
                                key={i}
                                aria-label={`Go to testimonial ${i + 1}`}
                                onClick={() => go(i)}
                                className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-accent" : "w-1.5 bg-foreground/25"
                                    }`}
                            />
                        ))}
                    </div>
                    <button
                        aria-label="Next testimonial"
                        onClick={() => go(index + 1)}
                        className="flex h-11 w-11 items-center justify-center rounded-full border border-line transition-colors hover:border-accent hover:text-accent"
                    >
                        <span aria-hidden>→</span>
                    </button>
                </div>
            </div>
        </section>
    );
}
