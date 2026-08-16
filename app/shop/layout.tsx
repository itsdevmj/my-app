import type { Metadata } from "next";
import { getProducts, getShopCategories } from "@/app/lib/content-store";
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

export default async function ShopLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    /* Read once here and hand it to the cart, so the drawer prices from the
       database rather than from the static catalogue. */
    const [products, categories] = await Promise.all([getProducts(), getShopCategories()]);

    return (
        <CartProvider catalogue={products}>
            <ShopNav categories={categories} />
            {children}
            <ShopFooter categories={categories} />
        </CartProvider>
    );
}
