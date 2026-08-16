"use client";

import Image from "next/image";
import { useActionState } from "react";
import {
    readWhatsAppOrder,
    type OrderLookupState,
} from "@/app/admin/actions";
import { Result, Submit } from "@/app/admin/ui";
import { price } from "@/app/lib/shop";

const INITIAL: OrderLookupState = {};

export function OrderReader() {
    const [state, formAction] = useActionState(readWhatsAppOrder, INITIAL);

    return (
        <>
            <form action={formAction} className="panel rounded-lg p-5 sm:p-6">
                <label htmlFor="order-message" className="text-sm font-extrabold tracking-tight">
                    Buyer message
                </label>
                <textarea
                    id="order-message"
                    name="message"
                    required
                    rows={9}
                    maxLength={50000}
                    placeholder="Paste the complete WhatsApp message here"
                    className="mt-3 w-full resize-y rounded-lg border border-line-strong bg-bg px-4 py-3 font-mono text-xs leading-relaxed text-fg outline-none transition-colors placeholder:text-fg-dim focus:border-accent"
                />
                <div className="mt-4 flex flex-wrap items-center gap-4">
                    <Submit loadingLabel="Reading order">Load order details</Submit>
                    <Result state={state} />
                </div>
            </form>

            {state.order && (
                <section className="mt-8">
                    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-4">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-fg-dim">Received</p>
                            <h2 className="mt-1 text-lg font-extrabold tracking-tight">
                                {new Date(state.order.createdAt).toLocaleString()}
                            </h2>
                        </div>
                        <div className="text-right">
                            <p className="text-xs uppercase tracking-wider text-fg-dim">Current total</p>
                            <p className="h-section mt-1 text-3xl">{price(state.order.totalNaira)}</p>
                        </div>
                    </div>

                    <ul className="mt-5 space-y-3">
                        {state.order.lines.map((line, index) => (
                            <li key={`${line.handle}-${line.variant}-${index}`} className="panel rounded-lg p-4">
                                <div className="flex flex-wrap items-center gap-4">
                                    <div className="media relative size-20 shrink-0 rounded-lg">
                                        <Image
                                            src={line.image}
                                            alt=""
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-extrabold tracking-tight">{line.name}</p>
                                        <p className="mt-1 text-xs text-fg-dim">
                                            {line.variant} · Quantity {line.qty} · {line.digital ? "Digital" : "Physical"}
                                        </p>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${line.inStock ? "border-emerald-400/30 text-emerald-300" : "border-red-400/35 text-red-300"}`}>
                                                {line.inStock ? "In stock" : "Sold out"}
                                            </span>
                                            {!line.variantValid && (
                                                <span className="rounded-full border border-red-400/35 px-2.5 py-1 text-[11px] font-bold text-red-300">
                                                    Option no longer available
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <p className="text-sm font-extrabold">{price(line.lineTotalNaira)}</p>
                                        <p className="mt-1 text-[11px] text-fg-dim">
                                            {price(line.unitPriceNaira)} each
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>

                    <div className="mt-5 rounded-lg border border-accent/35 bg-accent/10 p-4 text-sm leading-relaxed text-fg-muted">
                        Confirm delivery and payment directly with the buyer. Prices shown here come from the current catalogue.
                    </div>
                </section>
            )}
        </>
    );
}
