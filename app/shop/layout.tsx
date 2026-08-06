import type { Metadata } from "next";
import { CartProvider } from "./cart";
import { ShopFooter, ShopNav } from "./chrome";

/**
 * Chrome for the storefront. Served at /shop locally, and rewritten onto
 * shop.capturestudio.co by proxy.ts in production — so these routes are the
 * subdomain, and the marketing chrome from app/(site) never appears here.
 */
export const metadata: Metadata = {
    title: {
        default: "Capture Studio Shop — LUTs, Prints & Books",
        template: "%s · Capture Studio Shop",
    },
    description:
        "Grading tools, sound libraries, archival prints and books from the Capture Studio team. Everything here is something we made or use ourselves.",
    openGraph: {
        title: "Capture Studio Shop",
        description:
            "Grading tools, sound libraries, archival prints and books from the Capture Studio team.",
        siteName: "Capture Studio Shop",
        type: "website",
    },
};

export default function ShopLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <CartProvider>
            <ShopNav />
            {children}
            <ShopFooter />
        </CartProvider>
    );
}
