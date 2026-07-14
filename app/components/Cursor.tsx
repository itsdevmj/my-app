"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useState } from "react";

export default function Cursor() {
    const x = useMotionValue(-100);
    const y = useMotionValue(-100);
    const ringX = useSpring(x, { stiffness: 350, damping: 28, mass: 0.4 });
    const ringY = useSpring(y, { stiffness: 350, damping: 28, mass: 0.4 });
    const [active, setActive] = useState(false);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (window.matchMedia("(pointer: coarse)").matches) return;

        const move = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
            setVisible(true);
            const el = e.target as HTMLElement;
            setActive(!!el.closest("a, button, [data-cursor]"));
        };
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
    }, [x, y]);

    if (!visible) return null;

    return (
        <>
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[9997] hidden h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent lg:block"
                style={{ x, y }}
            />
            <motion.div
                className="pointer-events-none fixed left-0 top-0 z-[9997] hidden -translate-x-1/2 -translate-y-1/2 rounded-full border border-accent lg:block"
                style={{ x: ringX, y: ringY }}
                animate={{ width: active ? 56 : 30, height: active ? 56 : 30, opacity: active ? 1 : 0.6 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            />
        </>
    );
}
