import Reveal from "./Reveal";

export default function CTA() {
    return (
        <section id="contact" className="border-t border-line bg-background py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                <Reveal className="mx-auto max-w-4xl text-center">
                    <p className="eyebrow mb-6">Let&apos;s talk</p>
                    <h2 className="display text-5xl leading-[0.95] sm:text-7xl lg:text-8xl">
                        Not limited to video, we&apos;re your{" "}
                        <span className="serif text-accent">creative</span> comrades
                    </h2>
                    <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-foreground/60">
                        Got questions, project ideas, or just want to say hi? We&apos;re all
                        ears — let&apos;s make something unforgettable together.
                    </p>
                    <a
                        href="mailto:hello@capturestudio.co"
                        className="mt-10 inline-flex rounded-full bg-accent px-9 py-4 text-base font-semibold text-background transition-transform duration-300 hover:scale-[1.04]"
                    >
                        Let&apos;s Collaborate
                    </a>
                </Reveal>

                <div className="mt-20 grid grid-cols-1 gap-8 border-t border-line pt-12 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        { label: "Address", value: "123 Artistic Lane, Suite 302, NY, USA" },
                        { label: "Email", value: "hello@capturestudio.co" },
                        { label: "Phone", value: "(416) 555-1234" },
                        { label: "Hours", value: "Sun – Thu · 9am to 5pm" },
                    ].map((item) => (
                        <div key={item.label}>
                            <p className="eyebrow mb-2">{item.label}</p>
                            <p className="text-sm text-foreground/80">{item.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
