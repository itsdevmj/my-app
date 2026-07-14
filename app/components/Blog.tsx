import { POSTS } from "./site-data";
import Reveal from "./Reveal";

export default function Blog() {
    return (
        <section className="border-t border-line bg-background py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <Reveal>
                        <p className="eyebrow mb-4">Journal</p>
                        <h2 className="display text-4xl sm:text-6xl">
                            Dive into our <span className="serif text-accent">blogs</span>
                        </h2>
                    </Reveal>
                    <Reveal delay={0.1}>
                        <a
                            href="#contact"
                            className="inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
                        >
                            Read all blogs
                            <span aria-hidden>→</span>
                        </a>
                    </Reveal>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {POSTS.map((post, i) => (
                        <Reveal
                            key={post.title}
                            delay={i * 0.1}
                            className="group flex flex-col overflow-hidden rounded-2xl border border-line"
                        >
                            <div className="relative aspect-[16/10] overflow-hidden">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={post.image}
                                    alt={post.title}
                                    loading="lazy"
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <span className="absolute left-4 top-4 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-background">
                                    {post.category}
                                </span>
                            </div>
                            <div className="flex flex-1 flex-col p-6">
                                <h3 className="text-lg font-semibold leading-snug transition-colors group-hover:text-accent">
                                    {post.title}
                                </h3>
                                <p className="mt-auto pt-6 text-xs text-foreground/50">
                                    {post.author} · {post.date}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
