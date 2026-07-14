"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export default function Preloader() {
    const [count, setCount] = useState(0);
    const [done, setDone] = useState(false);

    useEffect(() => {
        let raf: number;
        const start = performance.now();
        const duration = 1800;
        const tick = (now: number) => {
            const p = Math.min((now - start) / duration, 1);
            // ease-out
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.round(eased * 100));
            if (p < 1) raf = requestAnimationFrame(tick);
            else setTimeout(() => setDone(true), 350);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    useEffect(() => {
        document.body.style.overflow = done ? "" : "hidden";
        return () => {
            document.body.style.overflow = "";
        };
    }, [done]);

    return (
        <AnimatePresence>
            {!done && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background"
                    exit={{ y: "-100%" }}
                    transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
                >
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="eyebrow mb-8"
                    >
                        Capture / Studio
                    </motion.span>

                    <span className="display block text-center text-[26vw] leading-none text-foreground sm:text-[18vw] lg:text-[13rem]">
                        {count}
                        <span className="text-accent">%</span>
                    </span>

                    <div className="mt-10 h-[3px] w-64 overflow-hidden rounded-full bg-line">
                        <motion.div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${count}%` }}
                        />
                    </div>

                    <span className="eyebrow mt-6">Loading experience</span>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
