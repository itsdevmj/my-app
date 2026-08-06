import Link from "next/link";
import { price } from "@/app/lib/shop";
import { getLastSaved, getProducts, getProjects, getShots } from "@/app/lib/content-store";

function Stat({
    label,
    value,
    note,
}: {
    label: string;
    value: string;
    note?: string;
}) {
    return (
        <div className="panel rounded-xl p-5">
            <p className="text-xs uppercase tracking-wider text-fg-dim">{label}</p>
            <p className="h-section mt-2 text-3xl">{value}</p>
            {note && <p className="mt-1.5 text-xs text-fg-dim">{note}</p>}
        </div>
    );
}

export default async function AdminOverviewPage() {
    const [products, projects, shots, lastSaved] = await Promise.all([
        getProducts(),
        getProjects(),
        getShots(),
        getLastSaved(),
    ]);

    const inStock = products.filter((p) => p.inStock);
    const soldOut = products.filter((p) => !p.inStock);
    const digital = products.filter((p) => p.digital);
    const catalogueValue = products.reduce((sum, p) => sum + p.cents, 0);

    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">Overview</h1>
                <p className="mt-3 text-sm text-fg-muted">
                    {lastSaved
                        ? `Content last edited ${new Date(lastSaved).toLocaleString()}.`
                        : "No edits yet — the site is showing its default content."}
                </p>
            </header>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Stat label="Products" value={String(products.length)} note={`${digital.length} digital`} />
                <Stat label="In stock" value={String(inStock.length)} note={`${soldOut.length} sold out`} />
                <Stat label="Featured work" value={String(projects.length)} note="on the homepage" />
                <Stat label="Archive stills" value={String(shots.length)} note="in the gallery" />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Stat
                    label="Catalogue value"
                    value={price(catalogueValue)}
                    note="sum of all listed prices"
                />
                <Stat
                    label="Orders"
                    value="—"
                    note="no payment provider connected yet"
                />
            </div>

            {/* Honest about what this panel cannot do yet. */}
            <section className="panel mt-8 rounded-xl p-6">
                <h2 className="text-base font-extrabold tracking-tight">Before this goes live</h2>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed text-fg-muted">
                    <li className="flex gap-2.5">
                        <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>
                            <strong className="font-semibold text-fg">Storage is the filesystem.</strong>{" "}
                            Edits are written to <code>.data/content.json</code>. That works in
                            development and on a single Node server, but not on serverless
                            hosting or across multiple instances. Swap the read/write functions
                            in <code>app/lib/content-store.ts</code> for a database.
                        </span>
                    </li>
                    <li className="flex gap-2.5">
                        <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>
                            <strong className="font-semibold text-fg">No orders or payments.</strong>{" "}
                            The shop cart works, but checkout is intentionally disabled. Orders
                            will only appear here once a payment provider is wired up.
                        </span>
                    </li>
                    <li className="flex gap-2.5">
                        <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" />
                        <span>
                            <strong className="font-semibold text-fg">Single shared password.</strong>{" "}
                            Fine for one operator. If more than one person needs access, or you
                            need an audit trail, move to a real auth provider.
                        </span>
                    </li>
                </ul>
            </section>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                    { href: "/admin/work", label: "Edit featured work", note: "Homepage projects" },
                    { href: "/admin/shop", label: "Edit prices & stock", note: "Shop catalogue" },
                    { href: "/admin/settings", label: "Studio details", note: "Contact info" },
                ].map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className="panel rounded-xl p-5 transition-colors hover:border-accent"
                    >
                        <p className="text-sm font-extrabold tracking-tight">{item.label}</p>
                        <p className="mt-1 text-xs text-fg-dim">{item.note}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
