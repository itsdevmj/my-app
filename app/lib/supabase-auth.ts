import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import {
    isSupabaseAuthConfigured,
    supabaseAuthKey,
    supabaseUrl,
} from "./supabase";

/** Server-side Supabase Auth client with Next's request cookie store. */
export async function supabaseAuthServerClient() {
    if (!isSupabaseAuthConfigured()) {
        throw new Error("Supabase Auth is not configured.");
    }

    const cookieStore = await cookies();

    return createServerClient(supabaseUrl, supabaseAuthKey, {
        cookies: {
            getAll() {
                return cookieStore.getAll();
            },
            setAll(cookiesToSet) {
                try {
                    for (const { name, value, options } of cookiesToSet) {
                        cookieStore.set(name, value, options);
                    }
                } catch {
                    /* Server Components cannot always mutate cookies. Proxy and
                       Server Actions handle refresh writes when they can. */
                }
            },
        },
    });
}

export async function getSupabaseAuthUser() {
    if (!isSupabaseAuthConfigured()) return null;
    const client = await supabaseAuthServerClient();
    const { data, error } = await client.auth.getUser();
    return error ? null : data.user;
}

/** Admin access is granted explicitly through Supabase Auth metadata. */
export function isSupabaseAdminUser(user: User | null | undefined) {
    return user?.app_metadata?.role === "admin";
}

export async function getSupabaseAdminUser() {
    const user = await getSupabaseAuthUser();
    return isSupabaseAdminUser(user) ? user : null;
}
