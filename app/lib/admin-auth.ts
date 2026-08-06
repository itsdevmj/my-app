/* ===========================================================================
   ADMIN AUTH
   ---------------------------------------------------------------------------
   Deliberately small: a shared password exchanged for an HMAC-signed,
   httpOnly session cookie. No user table, because there is one operator.

   Uses Web Crypto only (no node:crypto), so the same module works in the
   Proxy runtime and in Server Components/Actions.

   FAILS CLOSED. If ADMIN_PASSWORD or ADMIN_SECRET are missing, nothing
   authenticates and /admin stays locked. Set both in .env.local:

     ADMIN_PASSWORD=<a long random string>
     ADMIN_SECRET=<a different long random string>

   This is appropriate for a single-operator studio site. If you ever need
   multiple accounts, roles, or audit trails, replace this with a real auth
   provider rather than extending it.
   ========================================================================= */

export const SESSION_COOKIE = "cs_admin";

/** Eight hours. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const encoder = new TextEncoder();

function secret() {
    return process.env.ADMIN_SECRET ?? "";
}

function password() {
    return process.env.ADMIN_PASSWORD ?? "";
}

/** Both secrets present and long enough to be worth anything. */
export function isConfigured() {
    return secret().length >= 16 && password().length >= 8;
}

/** Constant-time comparison, so failures leak no length or prefix info. */
function safeEqual(a: string, b: string) {
    const aBytes = encoder.encode(a);
    const bBytes = encoder.encode(b);
    /* Compare a fixed number of bytes regardless of input length. */
    const length = Math.max(aBytes.length, bBytes.length);
    let diff = aBytes.length ^ bBytes.length;
    for (let i = 0; i < length; i++) {
        diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
    }
    return diff === 0;
}

function toBase64Url(bytes: ArrayBuffer) {
    const binary = String.fromCharCode(...new Uint8Array(bytes));
    return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(payload: string) {
    const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secret()),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
    );
    const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    return toBase64Url(mac);
}

/** `<expiresAt>.<hmac>` — stateless, so there is no session store to keep. */
export async function createSessionToken(now = Date.now()) {
    const expiresAt = String(now + SESSION_TTL_MS);
    return `${expiresAt}.${await sign(expiresAt)}`;
}

export async function verifySessionToken(token: string | undefined) {
    if (!isConfigured() || !token) return false;

    const separator = token.lastIndexOf(".");
    if (separator <= 0) return false;

    const expiresAt = token.slice(0, separator);
    const mac = token.slice(separator + 1);

    if (!safeEqual(mac, await sign(expiresAt))) return false;

    const expiry = Number(expiresAt);
    return Number.isFinite(expiry) && expiry > Date.now();
}

export function verifyPassword(input: string) {
    /* The isConfigured() check must come first: without it, an unset
       ADMIN_PASSWORD would make an empty submission succeed. */
    return isConfigured() && safeEqual(input, password());
}
