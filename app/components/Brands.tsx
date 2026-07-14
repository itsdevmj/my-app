import { BRANDS } from "./site-data";

export default function Brands() {
    const doubled = [...BRANDS, ...BRANDS];
    return (
        <section className="border-y border-line bg-background py-12">
            <p className="eyebrow mb-8 text-center">
                Standing tall with our esteemed brand partners
            </p>
            <div className="relative flex overflow-hidden">
                <div className="marquee-track flex shrink-0 animate-marquee-slow items-center gap-16 pr-16">
                    {doubled.map((b, i) => (
                        <span
                            key={`${b}-${i}`}
                            className="display shrink-0 text-3xl text-foreground/25 transition-colors hover:text-foreground/60 sm:text-4xl"
                        >
                            {b}
                        </span>
                    ))}
                </div>
                <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent" />
            </div>
        </section>
    );
}
