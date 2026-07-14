const QUICK = ["Home", "Portfolio", "About", "Services", "Contact"];
const LEGAL = ["Privacy Policy", "Terms & Conditions", "Refund Policy"];
const SOCIAL = ["Instagram", "YouTube", "Vimeo", "TikTok", "LinkedIn"];

export default function Footer() {
    return (
        <footer className="border-t border-line bg-background pt-16 pb-10">
            <div className="mx-auto max-w-7xl px-5 sm:px-8">
                {/* Newsletter */}
                <div className="flex flex-col justify-between gap-8 border-b border-line pb-12 lg:flex-row lg:items-end">
                    <div className="max-w-md">
                        <a href="#top" className="flex items-center gap-2.5">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-background">
                                <span className="display text-lg leading-none">C</span>
                            </span>
                            <span className="text-[15px] font-semibold tracking-tight">
                                Capture<span className="text-accent">Studio</span>
                            </span>
                        </a>
                        <p className="mt-4 text-sm leading-relaxed text-foreground/50">
                            Turning moments into motion. Cinematic videography, striking
                            photography and marketing that moves.
                        </p>
                    </div>

                    <form
                        className="flex w-full max-w-sm items-center gap-2"
                        action="#"
                    >
                        <input
                            type="email"
                            required
                            placeholder="Your email"
                            className="flex-1 rounded-full border border-line bg-white/[0.03] px-5 py-3 text-sm text-foreground placeholder:text-foreground/40 focus:border-accent focus:outline-none"
                        />
                        <button
                            type="submit"
                            className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-background transition-transform duration-300 hover:scale-[1.04]"
                        >
                            Subscribe
                        </button>
                    </form>
                </div>

                {/* Link columns */}
                <div className="grid grid-cols-2 gap-8 py-12 sm:grid-cols-3">
                    <div>
                        <h4 className="eyebrow mb-4">Quick Links</h4>
                        <ul className="space-y-2.5 text-sm text-foreground/70">
                            {QUICK.map((l) => (
                                <li key={l}>
                                    <a className="transition-colors hover:text-accent" href="#top">
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="eyebrow mb-4">Legal</h4>
                        <ul className="space-y-2.5 text-sm text-foreground/70">
                            {LEGAL.map((l) => (
                                <li key={l}>
                                    <a className="transition-colors hover:text-accent" href="#">
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="eyebrow mb-4">Social</h4>
                        <ul className="space-y-2.5 text-sm text-foreground/70">
                            {SOCIAL.map((l) => (
                                <li key={l}>
                                    <a className="transition-colors hover:text-accent" href="#">
                                        {l}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="flex flex-col items-center justify-between gap-3 border-t border-line pt-8 text-xs text-foreground/40 sm:flex-row">
                    <p>© {new Date().getFullYear()} Capture Studio. All rights reserved.</p>
                    <p>Videography · Photography · Marketing</p>
                </div>
            </div>
        </footer>
    );
}
