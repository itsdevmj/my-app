import { SERVICES } from "./site-data";
import Reveal from "./Reveal";

export default function Services() {
    return (
        <section id="services" className="border-t border-line bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <Reveal className="mb-14 max-w-3xl">
                    <p className="eyebrow mb-4">What we do</p>
                    <h2 className="display text-4xl sm:text-6xl">
                        We&apos;re video pros in <span className="serif text-accent">many</span> industries
                    </h2>
                </Reveal>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {SERVICES.map((s, i) => (
                        <Reveal
                            key={s.title}
                            delay={(i % 3) * 0.08}
                            className="group relative overflow-hidden rounded-2xl border border-line"
                        >
                            <div className="relative aspect-[4/3] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={s.image}
                                    alt={s.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover opacity-70 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
                            </div>
                            <div className="absolute inset-x-0 bottom-0 p-6">
                                <h3 className="display text-2xl transition-colors group-hover:text-accent">
                                    {s.title}
                                </h3>
                                <p className="mt-2 max-h-0 overflow-hidden text-sm leading-relaxed text-foreground/60 opacity-0 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100">
                                    {s.desc}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
