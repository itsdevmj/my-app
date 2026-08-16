import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { isConfigured } from "@/app/lib/admin-auth";
import { isSupabaseAuthConfigured } from "@/app/lib/supabase";
import { isAuthed } from "../actions";
import { LoginForm } from "./form";

export const metadata: Metadata = {
    title: "Sign in",
    robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
    if (await isAuthed()) redirect("/admin");
    const supabaseAuth = isSupabaseAuthConfigured();

    return (
        <main className="grid min-h-screen place-items-center px-5 py-16">
            <div className="w-full max-w-sm">
                <div className="flex items-center gap-2.5">
                    <span className="grid size-7 place-items-center rounded-md bg-accent">
                        <span className="text-[15px] font-extrabold leading-none text-accent-fg">C</span>
                    </span>
                    <span className="text-[15px] font-extrabold tracking-tight">
                        Capture Studio Admin
                    </span>
                </div>

                <h1 className="h-section mt-8 text-3xl">Sign in</h1>
                <p className="mt-3 text-sm leading-relaxed text-fg-muted">
                    This panel manages the studio site and the shop.
                </p>

                {!supabaseAuth && !isConfigured() ? (
                    <div className="mt-6 rounded-lg border border-accent/40 bg-accent/10 p-4">
                        <p className="text-sm font-bold tracking-tight">Not configured yet</p>
                    </div>
                ) : (
                    <LoginForm supabaseAuth={supabaseAuth} />
                )}
            </div>
        </main>
    );
}
