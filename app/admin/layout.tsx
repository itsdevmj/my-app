import type { Metadata } from "next";
import Link from "next/link";
import { isAuthed } from "./actions";
import { AdminNav, LogoutButton } from "./nav";

export const metadata: Metadata = {
    title: { default: "Admin", template: "%s · Capture Studio Admin" },
    /* Keep the panel out of search results and previews. */
    robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    /* The login page renders inside this layout too, so the chrome is only
       drawn once there is a session. Proxy already blocks unauthenticated
       access to every /admin route except /admin/login. */
    const authed = await isAuthed();

    if (!authed) return <>{children}</>;

    return (
        <div className="min-h-screen lg:flex">
            {/* sidebar */}
            <aside className="border-b border-line bg-surface lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r">
                <div className="flex h-full flex-col gap-6 p-5">
                    <Link href="/admin" className="flex items-center gap-2.5">
                        <span className="grid size-7 place-items-center rounded-md bg-accent">
                            <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                        </span>
                        <span className="text-[15px] font-extrabold tracking-tight">Admin</span>
                    </Link>

                    <AdminNav />

                    <div className="mt-auto space-y-3">
                        <div className="space-y-1.5">
                            <Link
                                href="/"
                                className="block text-xs text-fg-dim transition-colors hover:text-accent"
                            >
                                View site ↗
                            </Link>
                            <Link
                                href="/shop"
                                className="block text-xs text-fg-dim transition-colors hover:text-accent"
                            >
                                View shop ↗
                            </Link>
                        </div>
                        <LogoutButton />
                    </div>
                </div>
            </aside>

            <main className="min-w-0 flex-1 px-5 py-8 sm:px-8 lg:py-12">{children}</main>
        </div>
    );
}
