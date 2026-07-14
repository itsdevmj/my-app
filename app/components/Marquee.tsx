import { MARQUEE_BOTTOM, MARQUEE_TOP } from "./site-data";

function Row({ images, reverse }: { images: string[]; reverse?: boolean }) {
    const doubled = [...images, ...images];
    return (
        <div className="flex overflow-hidden">
            <div
                className={`marquee-track flex shrink-0 gap-4 pr-4 ${reverse ? "animate-marquee-reverse" : "animate-marquee"
                    }`}
            >
                {doubled.map((src, i) => (
                    <div
                        key={`${src}-${i}`}
                        className="group relative h-48 w-72 shrink-0 overflow-hidden rounded-xl border border-line sm:h-60 sm:w-96"
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={src}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:scale-105 group-hover:grayscale-0"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function Marquee() {
    return (
        <section className="relative overflow-hidden bg-background py-6">
            <div className="flex flex-col gap-4">
                <Row images={MARQUEE_TOP} />
                <Row images={MARQUEE_BOTTOM} reverse />
            </div>
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background to-transparent sm:w-32" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-background to-transparent sm:w-32" />
        </section>
    );
}
