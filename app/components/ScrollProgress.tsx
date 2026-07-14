"use client";

import { motion, useScroll, useSpring } from "motion/react";

export default function ScrollProgress() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 120,
        damping: 30,
        restDelta: 0.001,
    });

    return (
        <motion.div
            style={{ scaleX }}
            className="fixed inset-x-0 top-0 z-[9996] h-[3px] origin-left bg-accent"
        />
    );
}
