const WORDS = ["Videography", "Photography", "Marketing", "Brand Films", "Direction"];

export default function MarqueeBand() {
    const items = [...WORDS, ...WORDS, ...WORDS];
    return (
        <section className="border-y border-line bg-accent py-5 text-ink">
            <div className="flex overflow-hidden">
                <div className="marquee-track flex shrink-0 animate-marquee items-center gap-8 pr-8">
                    {items.map((w, i) => (
                        <span key={`${w}-${i}`} className="flex shrink-0 items-center gap-8">
                            <span className="display text-3xl sm:text-5xl">{w}</span>
                            <span className="text-2xl sm:text-4xl">✳</span>
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
