import { PROCESS } from "./site-data";
import Reveal from "./Reveal";

export default function Process() {
    return (
        <section className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <Reveal className="mb-14 max-w-3xl">
                    <p className="eyebrow mb-4">How we work</p>
                    <h2 className="display text-4xl sm:text-6xl">
                        From concept to completion — <span className="serif text-accent">we&apos;ve</span> got you covered
                    </h2>
                </Reveal>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                    {PROCESS.map((step, i) => (
                        <Reveal
                            key={step.no}
                            delay={i * 0.1}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-white/[0.02]"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-accent text-sm font-semibold text-background">
                                    {step.no}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col gap-3 p-6 sm:p-7">
                                <h3 className="display text-2xl">{step.title}</h3>
                                <p className="text-sm leading-relaxed text-foreground/60">
                                    {step.desc}
                                </p>
                                <span className="mt-auto pt-4 text-xs font-semibold tracking-wide text-accent">
                                    LEARN MORE →
                                </span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
