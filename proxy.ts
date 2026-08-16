import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/app/lib/admin-auth";
import { getProxyAuth } from "@/app/lib/supabase-auth-proxy";
import { isSupabaseAuthConfigured } from "@/app/lib/supabase";

/**
 * Subdomain routing for shop.capturestudio.co.
 *
 * Next 16 renamed Middleware to Proxy; the file must be `proxy.ts` at the
 * project root, alongside `app`. Requests arriving on the `shop.` host are
 * rewritten onto the /shop route tree, so the storefront is served as the
 * subdomain root (shop.capturestudio.co/ -> /shop) while local development
 * keeps working at /shop with no host header games.
 *
 * Add the hostname to your DNS and to the deployment's domain list; the
 * rewrite alone does not provision it.
 */

/** Hosts that should resolve to the storefront. */
const SHOP_HOSTS = new Set([
    "shop.capturestudio.co",
    "shop.localhost:3000",
]);

function isShopHost(host: string) {
    return SHOP_HOSTS.has(host) || host.startsWith("shop.");
}

export async function proxy(request: NextRequest) {
    const host = request.headers.get("host") ?? "";
    const { pathname, search } = request.nextUrl;

    /* ---- admin gate ----
       Defence in depth only. Every Server Action re-verifies the session
       itself, because actions are reachable by direct POST and this check is
       not on that path. */
    if (pathname.startsWith("/admin")) {
        let authResponse: NextResponse | null = null;
        if (pathname !== "/admin/login") {
            let authed: boolean;
            if (isSupabaseAuthConfigured()) {
                const auth = await getProxyAuth(request);
                authed = Boolean(auth.user);
                authResponse = auth.response;
            } else {
                authed = await verifySessionToken(
                    request.cookies.get(SESSION_COOKIE)?.value,
                );
            }
            if (!authed) {
                const url = request.nextUrl.clone();
                url.pathname = "/admin/login";
                url.search = "";
                const redirectResponse = NextResponse.redirect(url);
                authResponse?.cookies
                    .getAll()
                    .forEach((cookie) => redirectResponse.cookies.set(cookie));
                return redirectResponse;
            }
        } else if (isSupabaseAuthConfigured()) {
            authResponse = (await getProxyAuth(request)).response;
        }
        /* The admin is never served from the shop subdomain. */
        return authResponse ?? NextResponse.next();
    }

    if (!isShopHost(host)) {
        /* On the primary host, keep /shop reachable directly in development but
           send it to the canonical subdomain in production. */
        return NextResponse.next();
    }

    /* Already pointing at the shop tree — nothing to do. */
    if (pathname === "/shop" || pathname.startsWith("/shop/")) {
        return NextResponse.next();
    }

    const url = request.nextUrl.clone();
    url.pathname = pathname === "/" ? "/shop" : `/shop${pathname}`;
    url.search = search;

    return NextResponse.rewrite(url);
}

export const config = {
    /* Skip static assets, image optimisation and metadata files. */
    matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico|txt|xml)$).*)"],
};
