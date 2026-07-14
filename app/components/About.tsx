"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { STATS } from "./site-data";

function Counter({ value, suffix }: { value: number; suffix: string }) {
    const nodeRef = useRef<HTMLSpanElement>(null);
    const inView = useInView(nodeRef, { once: true, amount: 0.6 });
    const [display, setDisplay] = useState(0);

    useEffect(() => {
        if (!inView) return;
        const controls = animate(0, value, {
            duration: 1.6,
            ease: [0.22, 1, 0.36, 1],
            onUpdate: (v) => setDisplay(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, value]);

    return (
        <span ref={nodeRef} className="display text-5xl sm:text-6xl">
            {display}
            <span className="text-accent">{suffix}</span>
        </span>
    );
}

export default function About() {
    return (
        <section
            id="about"
            className="border-t border-line bg-background py-20 sm:py-28"
        >
            <div className="mx-auto grid max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
                <div>
                    <p className="eyebrow mb-4">About our studio</p>
                    <h2 className="display text-4xl sm:text-6xl">
                        Crafting captivating <span className="serif text-accent">visual</span> narratives
                    </h2>
                    <p className="mt-6 max-w-lg text-base leading-relaxed text-foreground/70">
                        Established in 2011, Capture Studio has dedicated itself to crafting
                        visual stories defined by creativity, innovation and an unwavering
                        commitment to excellence in production.
                    </p>
                    <p className="mt-4 max-w-lg text-base leading-relaxed text-foreground/60">
                        Our mission is simple: transform ideas into compelling visual
                        stories. Every project is an opportunity to create something
                        extraordinary.
                    </p>
                    <a
                        href="#contact"
                        className="mt-8 inline-flex rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.04]"
                    >
                        Know more about us
                    </a>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-10 self-center">
                    {STATS.map((s) => (
                        <div key={s.label} className="border-t border-line pt-5">
                            <Counter value={s.value} suffix={s.suffix} />
                            <p className="mt-2 text-sm text-foreground/50">{s.label}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
