"use client";

/* ===========================================================================
   CART — external store, context wrapper, and the slide-in drawer
   ---------------------------------------------------------------------------
   Lines are keyed by handle + variant, so the same product in two sizes is
   two lines.

   Persistence uses a module-level store read through useSyncExternalStore
   rather than a setState-in-effect. That matters for two reasons:
     · `getServerSnapshot` returns an empty cart, so the server HTML and the
       first client render agree and hydration stays clean. React then swaps to
       the real snapshot immediately after.
     · No cascading render on mount.

   There is no checkout backend. The checkout button is inert and says so.
   ========================================================================= */

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import { findProduct, price, type Product } from "@/app/lib/shop";

const STORAGE_KEY = "capture-shop-cart";

export type CartLine = {
    handle: string;
    variant: string;
    qty: number;
};

type CartState = readonly CartLine[];

/* ---------------------------------------------------------------------------
   STORE
------------------------------------------------------------------------- */

const EMPTY: CartState = [];

let state: CartState = EMPTY;
let restored = false;
const listeners = new Set<() => void>();

function readStorage(): CartState {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return EMPTY;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return EMPTY;
        /* Drop malformed lines and anything no longer in the catalogue. */
        const clean = parsed.filter(
            (l): l is CartLine =>
                !!l &&
                typeof l.handle === "string" &&
                typeof l.variant === "string" &&
                typeof l.qty === "number" &&
                l.qty > 0 &&
                !!findProduct(l.handle),
        );
        return clean.length > 0 ? clean : EMPTY;
    } catch {
        /* Corrupt JSON or storage blocked — start empty rather than crash. */
        return EMPTY;
    }
}

/** Lazily pull persisted state in on first client read. */
function ensureRestored() {
    if (restored || typeof window === "undefined") return;
    restored = true;
    state = readStorage();
}

function emit() {
    for (const listener of listeners) listener();
}

function write(next: CartState) {
    state = next;
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        /* Quota or private mode — cart just will not survive a reload. */
    }
    emit();
}

function subscribe(onChange: () => void) {
    ensureRestored();
    listeners.add(onChange);

    /* Keep multiple tabs in agreement. */
    const onStorage = (e: StorageEvent) => {
        if (e.key !== STORAGE_KEY) return;
        state = readStorage();
        emit();
    };
    window.addEventListener("storage", onStorage);

    return () => {
        listeners.delete(onChange);
        window.removeEventListener("storage", onStorage);
    };
}

function getSnapshot(): CartState {
    ensureRestored();
    return state;
}

function getServerSnapshot(): CartState {
    return EMPTY;
}

const sameLine = (l: CartLine, handle: string, variant: string) =>
    l.handle === handle && l.variant === variant;

/* ---------------------------------------------------------------------------
   CONTEXT
------------------------------------------------------------------------- */

type CartApi = {
    lines: CartState;
    /** Live, database-backed product lookup. */
    lookup: (handle: string) => Product | undefined;
    count: number;
    subtotal: number;
    isOpen: boolean;
    open: () => void;
    close: () => void;
    add: (handle: string, variant: string, qty?: number) => void;
    setQty: (handle: string, variant: string, qty: number) => void;
    remove: (handle: string, variant: string) => void;
};

const CartContext = createContext<CartApi | null>(null);

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
    return ctx;
}

/**
 * `catalogue` is the live, database-backed product list, passed down from the
 * shop layout, so prices and images in the cart reflect admin edits.
 *
 * The admin currently edits existing products only, so the seeded handle list
 * remains a valid lightweight check for persisted cart lines.
 */
export function CartProvider({
    children,
    catalogue,
}: {
    children: ReactNode;
    catalogue: readonly Product[];
}) {
    const lines = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
    const [isOpen, setIsOpen] = useState(false);

    const byHandle = useMemo(
        () => new Map(catalogue.map((product) => [product.handle, product])),
        [catalogue],
    );
    const lookup = useCallback(
        (handle: string) => byHandle.get(handle),
        [byHandle],
    );

    const add = useCallback((handle: string, variant: string, qty = 1) => {
        const existing = state.find((l) => sameLine(l, handle, variant));
        write(
            existing
                ? state.map((l) => (sameLine(l, handle, variant) ? { ...l, qty: l.qty + qty } : l))
                : [...state, { handle, variant, qty }],
        );
        setIsOpen(true);
    }, []);

    const setQty = useCallback((handle: string, variant: string, qty: number) => {
        write(
            qty <= 0
                ? state.filter((l) => !sameLine(l, handle, variant))
                : state.map((l) => (sameLine(l, handle, variant) ? { ...l, qty } : l)),
        );
    }, []);

    const remove = useCallback((handle: string, variant: string) => {
        write(state.filter((l) => !sameLine(l, handle, variant)));
    }, []);

    const { count, subtotal } = useMemo(() => {
        let c = 0;
        let s = 0;
        for (const line of lines) {
            const product = byHandle.get(line.handle);
            if (!product) continue;
            c += line.qty;
            s += product.priceNaira * line.qty;
        }
        return { count: c, subtotal: s };
    }, [lines, byHandle]);

    const value = useMemo<CartApi>(
        () => ({
            lines,
            lookup,
            count,
            subtotal,
            isOpen,
            open: () => setIsOpen(true),
            close: () => setIsOpen(false),
            add,
            setQty,
            remove,
        }),
        [lines, lookup, count, subtotal, isOpen, add, setQty, remove],
    );

    return (
        <CartContext.Provider value={value}>
            {children}
            <CartDrawer />
        </CartContext.Provider>
    );
}

/* ---------------------------------------------------------------------------
   DRAWER
------------------------------------------------------------------------- */

function CartDrawer() {
    const { lines, lookup, count, subtotal, isOpen, close, setQty, remove } =
        useCart();

    /* Esc to close + scroll lock while open. */
    useEffect(() => {
        if (!isOpen) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener("keydown", onKey);
        };
    }, [isOpen, close]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[70] flex justify-end">
                    <motion.div
                        key="scrim"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={close}
                        className="absolute inset-0 bg-bg/80 backdrop-blur-sm"
                    />

                    <motion.aside
                        key="panel"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Cart"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
                        className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-surface"
                    >
                        {/* head */}
                        <div className="flex items-center justify-between border-b border-line px-5 py-4">
                            <h2 className="text-sm font-extrabold tracking-tight">
                                Cart
                                <span className="ml-2 text-fg-dim">{count}</span>
                            </h2>
                            <button
                                type="button"
                                onClick={close}
                                autoFocus
                                aria-label="Close cart"
                                className="grid size-9 place-items-center rounded-full border border-line-strong transition-colors hover:border-accent hover:text-accent"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                                    <path d="M6 6l12 12M18 6L6 18" />
                                </svg>
                            </button>
                        </div>

                        {/* lines */}
                        {lines.length === 0 ? (
                            <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                                <p className="text-sm text-fg-dim">Nothing in the cart yet.</p>
                                <Link
                                    href="/shop"
                                    onClick={close}
                                    className="text-sm font-bold tracking-tight text-accent underline underline-offset-4"
                                >
                                    Browse the shop
                                </Link>
                            </div>
                        ) : (
                            <ul className="flex-1 divide-y divide-line overflow-y-auto">
                                {lines.map((line) => {
                                    const product = lookup(line.handle);
                                    if (!product) return null;
                                    return (
                                        <li key={`${line.handle}-${line.variant}`} className="flex gap-4 p-5">
                                            <Link
                                                href={`/shop/${product.handle}`}
                                                onClick={close}
                                                className="media relative size-20 shrink-0 rounded-lg"
                                            >
                                                <Image
                                                    src={product.images[0]}
                                                    alt={product.name}
                                                    fill
                                                    sizes="80px"
                                                    className="object-cover"
                                                />
                                            </Link>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <Link
                                                            href={`/shop/${product.handle}`}
                                                            onClick={close}
                                                            className="block truncate text-sm font-extrabold tracking-tight hover:text-accent"
                                                        >
                                                            {product.name}
                                                        </Link>
                                                        <p className="mt-0.5 truncate text-xs text-fg-dim">
                                                            {line.variant}
                                                        </p>
                                                    </div>
                                                    <span className="shrink-0 text-sm font-bold">
                                                        {price(product.priceNaira * line.qty)}
                                                    </span>
                                                </div>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <div className="flex items-center rounded-full border border-line-strong">
                                                        <button
                                                            type="button"
                                                            onClick={() => setQty(line.handle, line.variant, line.qty - 1)}
                                                            aria-label={`Decrease quantity of ${product.name}`}
                                                            className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:text-accent"
                                                        >
                                                            −
                                                        </button>
                                                        <span className="w-7 text-center text-sm font-bold" aria-live="polite">
                                                            {line.qty}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setQty(line.handle, line.variant, line.qty + 1)}
                                                            aria-label={`Increase quantity of ${product.name}`}
                                                            className="grid size-8 place-items-center rounded-full text-fg-muted transition-colors hover:text-accent"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => remove(line.handle, line.variant)}
                                                        className="text-xs text-fg-dim underline underline-offset-4 transition-colors hover:text-fg"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}

                        {/* foot */}
                        {lines.length > 0 && (
                            <div className="border-t border-line p-5">
                                <div className="flex items-baseline justify-between">
                                    <span className="text-sm text-fg-muted">Subtotal</span>
                                    <span className="h-section text-2xl">{price(subtotal)}</span>
                                </div>
                                <p className="mt-2 text-xs text-fg-dim">
                                    Digital items deliver instantly. Shipping and tax on physical
                                    items are calculated at checkout.
                                </p>

                                {/* NOTE: no payment backend. Wire this to a real provider
                    (e.g. a Stripe Checkout session created in a route handler)
                    before launch — it does nothing on purpose right now. */}
                                <button
                                    type="button"
                                    disabled
                                    className="mt-4 w-full cursor-not-allowed rounded-full bg-accent px-6 py-3.5 text-sm font-bold tracking-tight text-accent-fg opacity-60"
                                >
                                    Checkout — not connected yet
                                </button>
                            </div>
                        )}
                    </motion.aside>
                </div>
            )}
        </AnimatePresence>
    );
}
