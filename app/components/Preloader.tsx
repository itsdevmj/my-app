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
                        className="eyebrow mb-6"
                    >
                        Capture Studio
                    </motion.span>

                    <div className="relative h-[1.1em] overflow-hidden">
                        <motion.span className="display block text-[22vw] leading-none text-foreground sm:text-[16vw]">
                            {count}
                            <span className="text-accent">%</span>
                        </motion.span>
                    </div>

                    <div className="mt-8 h-px w-56 overflow-hidden bg-line">
                        <motion.div
                            className="h-full bg-accent"
                            style={{ width: `${count}%` }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
