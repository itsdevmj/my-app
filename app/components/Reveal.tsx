"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
    children: ReactNode;
    className?: string;
    /** Delay in seconds before the reveal starts. */
    delay?: number;
    /** Travel distance in px. */
    y?: number;
    /** Render as a specific element. Defaults to a div. */
    as?: "div" | "section" | "li" | "span";
};

/**
 * Fade + rise on scroll into view. Respects reduced-motion preferences.
 */
export default function Reveal({
    children,
    className,
    delay = 0,
    y = 40,
    as = "div",
}: RevealProps) {
    const reduce = useReducedMotion();
    const MotionTag = motion[as];

    return (
        <MotionTag
            className={className}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </MotionTag>
    );
}
