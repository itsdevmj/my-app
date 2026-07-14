import { PORTFOLIO } from "./site-data";
import Reveal from "./Reveal";

export default function Portfolio() {
    return (
        <section id="portfolio" className="bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <Reveal>
                        <p className="eyebrow mb-4">Featured work</p>
                        <h2 className="display text-4xl sm:text-6xl">
                            Our handpicked <br />
                            <span className="serif text-accent">featured</span> portfolio
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                        >
                            See all projects
                            <span aria-hidden>→</span>
                        </a>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {PORTFOLIO.map((p, i) => (
                        <Reveal
                            key={p.title}
                            delay={(i % 3) * 0.08}
                            className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-line"
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={p.image}
                                alt={p.title}
                                loading="lazy"
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/10 to-transparent" />
                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                                <div>
                                    <span className="eyebrow text-accent">{p.client}</span>
                                    <h3 className="display mt-1 text-2xl sm:text-3xl">
                                        {p.title}
                                    </h3>
                                </div>
                                <span className="flex h-11 w-11 shrink-0 translate-y-3 items-center justify-center rounded-full bg-accent text-background opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                                    <span aria-hidden>↗</span>
                                </span>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
