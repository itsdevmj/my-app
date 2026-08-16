import type { Metadata } from "next";
import { OrderReader } from "./reader";

export const metadata: Metadata = { title: "Orders" };

export default function AdminOrdersPage() {
    return (
        <div className="mx-auto max-w-5xl">
            <header>
                <h1 className="h-section text-3xl sm:text-4xl">WhatsApp orders</h1>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
                    Paste the order message from the buyer to load its current catalogue details.
                </p>
            </header>

            <div className="mt-8">
                <OrderReader />
            </div>
        </div>
    );
}
