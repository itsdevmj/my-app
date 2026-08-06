import { SiteFooter, SiteNav } from "@/app/components/site-ui";

/**
 * Chrome for the marketing site (capturestudio.co). The shop lives under
 * app/shop with its own layout, so the two never share a nav.
 */
export default function SiteLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <>
            <SiteNav />
            {children}
            <SiteFooter />
        </>
    );
}
