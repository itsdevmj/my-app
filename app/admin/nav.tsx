"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "./actions";

const LINKS = [
    { label: "Overview", href: "/admin" },
    { label: "Work", href: "/admin/work" },
    { label: "Shop", href: "/admin/shop" },
    { label: "Archive", href: "/admin/archive" },
    { label: "Settings", href: "/admin/settings" },
] as const;

export function AdminNav() {
    const pathname = usePathname();

    return (
        <nav aria-label="Admin sections" className="flex flex-col gap-1">
            {LINKS.map((link) => {
                const active =
                    link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
                return (
                    <Link
                        key={link.href}
                        href={link.href}
                        aria-current={active ? "page" : undefined}
                        className={`rounded-lg px-3.5 py-2.5 text-sm font-semibold transition-colors duration-200 ${active
                                ? "bg-accent text-accent-fg"
                                : "text-fg-muted hover:bg-surface-3 hover:text-fg"
                            }`}
                    >
                        {link.label}
                    </Link>
                );
            })}
        </nav>
    );
}

export function LogoutButton() {
    return (
        <form action={logout}>
            <button
                type="submit"
                className="w-full rounded-lg border border-line-strong px-3.5 py-2.5 text-sm font-semibold text-fg-muted transition-colors hover:border-accent hover:text-accent"
            >
                Sign out
            </button>
        </form>
    );
}
