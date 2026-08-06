"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../actions";

const INITIAL: LoginState = {};

export function LoginForm() {
    const [state, formAction, pending] = useActionState(login, INITIAL);

    return (
        <form action={formAction} className="mt-8">
            <label htmlFor="password" className="block text-sm font-semibold">
                Password
            </label>
            <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                autoFocus
                className="mt-2 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-accent"
                placeholder="••••••••••••"
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
