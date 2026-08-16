import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
    isSupabaseAuthConfigured,
    supabaseAuthKey,
    supabaseUrl,
} from "./supabase";
import { isSupabaseAdminUser } from "./supabase-auth";

/** Validates and refreshes the Supabase Auth cookie in Next Proxy. */
export async function getProxyAuth(request: NextRequest) {
    let response = NextResponse.next({ request });
    if (!isSupabaseAuthConfigured()) return { user: null, response };

    const client = createServerClient(supabaseUrl, supabaseAuthKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll();
            },
            setAll(cookiesToSet) {
                for (const { name, value } of cookiesToSet) {
                    request.cookies.set(name, value);
                }
                response = NextResponse.next({ request });
                for (const { name, value, options } of cookiesToSet) {
                    response.cookies.set(name, value, options);
                }
            },
        },
    });

    const { data, error } = await client.auth.getUser();
    return {
        user: error || !isSupabaseAdminUser(data.user) ? null : data.user,
        response,
    };
}
