/* ===========================================================================
   SUPABASE — server only
   ---------------------------------------------------------------------------
   Nothing in this app talks to Supabase from the browser: the public site reads
   content in Server Components and the admin writes from Server Actions. That
   deliberately shapes the integration:

     · Content reads/writes use the secret key server-side. Admin sessions use
       Supabase Auth through @supabase/ssr and an HTTP-only cookie.

     · The connection uses the SECRET key, which bypasses Row Level Security.
       That is safe only because this module never reaches the client, and it is
       why the schema enables RLS with no policies at all: if the publishable
       key ever leaks it can read nothing.

   KEY NAMES — Supabase renamed its keys. `anon` became the publishable key and
   `service_role` became the secret key, with legacy keys still working during
   migration. Both spellings are accepted below so either generation works.
   See: https://supabase.com/docs/guides/getting-started/migrating-to-new-api-keys

   NEVER import this from a Client Component, and never prefix the secret key
   with NEXT_PUBLIC_.
   ========================================================================= */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/* New name first, legacy second. */
export const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** Publishable key for Supabase Auth. The secret key is a server-only fallback. */
export const supabaseAuthKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    supabaseSecretKey;

export function isSupabaseAuthConfigured() {
    return supabaseUrl.length > 0 && supabaseAuthKey.length > 0;
}

/**
 * True when both the URL and a server key are present. Everything falls back to
 * local filesystem storage when this is false, so the app still runs before a
 * Supabase project exists.
 */
export function isSupabaseConfigured() {
    return supabaseUrl.length > 0 && supabaseSecretKey.length > 0;
}

/** Hostname of the Supabase project, for next.config remotePatterns. */
export function supabaseHostname(): string | null {
    if (!supabaseUrl) return null;
    try {
        return new URL(supabaseUrl).hostname;
    } catch {
        return null;
    }
}

let cached: SupabaseClient | null = null;

/**
 * Server-side client. Throws rather than returning a half-working client, so a
 * misconfiguration fails loudly instead of silently writing nowhere.
 */
export function supabaseAdmin(): SupabaseClient {
    if (!isSupabaseConfigured()) {
        throw new Error(
            "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY.",
        );
    }
    if (cached) return cached;

    cached = createClient(supabaseUrl, supabaseSecretKey, {
        auth: {
            /* No user sessions on the server — do not try to persist or refresh. */
            persistSession: false,
            autoRefreshToken: false,
        },
    });

    return cached;
}
