import type { Metadata } from "next";

export const metadata: Metadata = {
    title: { default: "Admin", template: "%s · Capture Studio Admin" },
    /* Keep the panel out of search results and previews. */
    robots: { index: false, follow: false, nocache: true },
};

/**
 * Shared metadata only. The session guard and the sidebar live in
 * app/admin/(protected)/layout.tsx so that /admin/login can render without
 * either of them.
 */
export default function AdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return <>{children}</>;
}
