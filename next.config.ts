import type { NextConfig } from "next";

/**
 * Unsplash source URLs are built by the `img()` helper in app/lib/site.ts,
 * which pins the query string to exactly one of these two variants. Keeping
 * `search` as an exact match matters: omitting it implies the `**` wildcard,
 * which would let anyone push arbitrary Unsplash transformations through our
 * optimizer.
 *
 * If you add a new variant here, add it to IMG_SIZES in app/lib/site.ts too.
 */
const UNSPLASH_VARIANTS = [
  "?auto=format&fit=crop&w=2000&q=80", // lg — hero frames, portraits
  "?auto=format&fit=crop&w=800&q=80", // sm — cards, thumbnails, previews
] as const;

type RemotePattern = NonNullable<
  NonNullable<NextConfig["images"]>["remotePatterns"]
>[number];

const remotePatterns: RemotePattern[] = UNSPLASH_VARIANTS.map((search) => ({
  protocol: "https",
  hostname: "images.unsplash.com",
  port: "",
  pathname: "/**",
  search,
}));

/**
 * Admin uploads go to Cloudinary, so next/image has to be allowed to fetch
 * from its delivery host. Scoped to this account's path prefix rather than the
 * whole hostname, so it cannot be used to proxy arbitrary Cloudinary accounts
 * through our optimizer.
 */
const cloudName =
  process.env.CLOUDINARY_CLOUD_NAME ??
  process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ??
  "";

if (cloudName) {
  remotePatterns.push({
    protocol: "https",
    hostname: "res.cloudinary.com",
    port: "",
    pathname: `/${cloudName}/**`,
  });
}

const nextConfig: NextConfig = {
  images: { remotePatterns },
  experimental: {
    /* Admin image uploads are capped at 8MB in app/lib/uploads.ts. */
    serverActions: { bodySizeLimit: "9mb" },
  },
};

export default nextConfig;
