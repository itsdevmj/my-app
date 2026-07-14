"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FAQS } from "./site-data";

export default function FAQ() {
    const [open, setOpen] = useState<number | null>(0);

    return (
        <section className="border-t border-line bg-background py-20 sm:py-28">
            <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-20">
                <div>
                    <p className="eyebrow mb-4">FAQs</p>
                    <h2 className="display text-4xl sm:text-5xl">
                        Curious? Check out <br />
                        the <span className="serif text-accent">scoop</span>
                    </h2>
                </div>

                <div className="divide-y divide-line border-y border-line">
                    {FAQS.map((item, i) => {
                        const isOpen = open === i;
                        return (
                            <div key={item.q}>
                                <button
                                    onClick={() => setOpen(isOpen ? null : i)}
                                    className="flex w-full items-center justify-between gap-6 py-5 text-left"
                                >
                                    <span className="text-lg font-medium">{item.q}</span>
                                    <span
                                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-lg transition-all duration-300 ${isOpen ? "rotate-45 border-accent bg-accent text-background" : ""
                                            }`}
                                    >
                                        +
                                    </span>
                                </button>
                                <AnimatePresence initial={false}>
                                    {isOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                                            className="overflow-hidden"
                                        >
                                            <p className="pb-6 pr-12 text-sm leading-relaxed text-foreground/60">
                                                {item.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
