import type { NextConfig } from "next";

/**
 * Unsplash source URLs are built by the `img()` helper in app/page.tsx, which
 * pins the query string to exactly one of these two variants. Keeping `search`
 * as an exact match matters: omitting it implies the `**` wildcard, which would
 * let anyone push arbitrary Unsplash transformations through our optimizer.
 *
 * If you add a new variant here, add it to IMG_SIZES in app/page.tsx too.
 */
const UNSPLASH_VARIANTS = [
  "?auto=format&fit=crop&w=2000&q=80", // lg — hero lead frame, studio portrait
  "?auto=format&fit=crop&w=800&q=80", // sm — side frames, work previews
] as const;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: UNSPLASH_VARIANTS.map((search) => ({
      protocol: "https" as const,
      hostname: "images.unsplash.com",
      port: "",
      pathname: "/**",
      search,
    })),
  },
};

export default nextConfig;
