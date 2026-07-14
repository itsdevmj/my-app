"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { HERO_POSTER, VIDEOS } from "./site-data";

export default function Showreel() {
    const ref = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);

    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "center center"],
    });
    const width = useTransform(scrollYProgress, [0, 1], ["78%", "100%"]);
    const radius = useTransform(scrollYProgress, [0, 1], ["1.5rem", "0.75rem"]);

    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };

    return (
        <section id="showreel" className="bg-background py-16 sm:py-24">
            <div className="mx-auto mb-8 flex max-w-7xl items-center justify-between px-5 sm:px-8">
                <p className="eyebrow text-accent">Showreel</p>
                <p className="eyebrow hidden sm:block">2026 · Reel</p>
            </div>

            <div ref={ref} className="flex justify-center px-5 sm:px-8">
                <motion.div
                    style={{ width, borderRadius: radius }}
                    className="relative aspect-video overflow-hidden border border-line bg-neutral-900"
                >
                    <video
                        ref={videoRef}
                        className="h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        poster={HERO_POSTER}
                    >
                        <source src={VIDEOS.showreel} type="video/mp4" />
                    </video>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/40 via-transparent to-transparent" />

                    <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full bg-background/50 px-4 py-2 backdrop-blur-md">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
                        <span className="text-xs font-medium tracking-wide">Now playing</span>
                    </div>

                    <button
                        onClick={toggleMute}
                        className="absolute bottom-5 right-5 rounded-full bg-background/50 px-4 py-2 text-xs font-semibold backdrop-blur-md transition-colors hover:bg-accent hover:text-background"
                    >
                        {muted ? "Unmute" : "Mute"}
                    </button>
                </motion.div>
            </div>
        </section>
    );
}
