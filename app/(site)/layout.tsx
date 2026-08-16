import { SiteFooter, SiteNav } from "@/app/components/site-ui";
import { getStudio } from "@/app/lib/content-store";

/**
 * Chrome for the marketing site (capturestudio.co). The shop lives under
 * app/shop with its own layout, so the two never share a nav.
 *
 * Studio details are read here and passed to the footer, so editing them in the
 * admin updates every page under this layout.
 */
export default async function SiteLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const studio = await getStudio();

    return (
        <>
            <SiteNav />
            {children}
            <SiteFooter studio={studio} />
        </>
    );
}
