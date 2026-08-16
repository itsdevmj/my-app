import { redirect } from "next/navigation";
import { isAuthed } from "../actions";
import { AdminShell } from "../nav";

/**
 * Guard for every admin route except /admin/login, which sits outside this
 * route group. `(protected)` does not appear in URLs.
 *
 * This check is NOT redundant with proxy.ts. Next.js has shipped Proxy/
 * Middleware bypass advisories before, and a bypass there would otherwise
 * render these pages to an anonymous visitor. Authorisation is enforced in
 * three places independently: here, in proxy.ts, and inside every Server
 * Action.
 */
export default async function ProtectedAdminLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    if (!(await isAuthed())) redirect("/admin/login");

    return (
        /* The rail is fixed, so the main column is offset rather than flexed. */
        <div className="min-h-screen lg:pl-64">
            <AdminShell />
            {/* pt clears the mobile trigger bar; on desktop the rail sits beside us */}
            <main className="min-w-0 px-5 pb-16 pt-20 sm:px-8 lg:pt-12">{children}</main>
        </div>
    );
}
