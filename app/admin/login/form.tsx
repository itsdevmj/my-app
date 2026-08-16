"use client";

import { useActionState, useEffect } from "react";
import { login, type LoginState } from "../actions";
import { ActionPending, useToast } from "@/app/components/toaster";

const INITIAL: LoginState = {};

export function LoginForm({ supabaseAuth }: { supabaseAuth: boolean }) {
    const [state, formAction, pending] = useActionState(login, INITIAL);
    const { push } = useToast();

    useEffect(() => {
        if (state.error) {
            push({ announce: false, kind: "error", message: state.error });
        }
    }, [push, state]);

    return (
        <form action={formAction} className="mt-8">
            <ActionPending label="Signing in" />
            {supabaseAuth && (
                <>
                    <label htmlFor="email" className="block text-sm font-semibold">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username"
                        autoFocus
                        className="mt-2 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-accent"
                        placeholder="you@example.com"
                    />
                </>
            )}

            <label htmlFor="password" className="block text-sm font-semibold">
                <span className="mt-5 block">Password</span>
            </label>
            <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                autoFocus={!supabaseAuth}
                className="mt-2 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-accent"
                placeholder="Your password"
            />

            {state.error && (
                <p role="alert" className="mt-3 text-sm text-accent">
                    {state.error}
                </p>
            )}

            <button
                type="submit"
                disabled={pending}
                className="mt-6 w-full rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg transition-transform duration-300 enabled:hover:scale-[1.02] disabled:opacity-60"
            >
                {pending ? "Checking…" : "Sign in"}
            </button>
        </form>
    );
}
