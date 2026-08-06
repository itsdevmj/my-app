/* ===========================================================================
   Shared site data and helpers, used by the homepage and the archive page.
   ========================================================================= */

/**
 * Unsplash sources. The query string has to match one of the
 * `remotePatterns.search` values in next.config.ts exactly, so it is pinned to
 * two tiers here rather than being interpolated per call. next/image handles
 * the actual per-breakpoint resizing from these sources.
 */
export const IMG_SIZES = {
    lg: "?auto=format&fit=crop&w=2000&q=80",
    sm: "?auto=format&fit=crop&w=800&q=80",
} as const;

export const img = (id: string, size: keyof typeof IMG_SIZES = "lg") =>
    `https://images.unsplash.com/${id}${IMG_SIZES[size]}`;

export const STUDIO = {
    name: "Capture Studio",
    email: "hello@capturestudio.co",
    phone: "+1 (416) 555-1234",
    address: "123 Artistic Lane, Suite 302, New York, NY 10013",
} as const;

/* Root-relative so these resolve from any route, not just the homepage. */
export const NAV = [
    { label: "Work", href: "/#work" },
    { label: "Archive", href: "/archive" },
    { label: "Services", href: "/#services" },
    { label: "Shop", href: "/shop" },
    { label: "Contact", href: "/#contact" },
] as const;

export const FOOTER_NAV = {
    Work: ["Brand films", "Commercials", "Documentary", "Photography"],
    Studio: ["About", "Team", "Careers", "Journal"],
    Social: ["Instagram", "Vimeo", "YouTube", "LinkedIn"],
} as const;

/* ---------------------------------------------------------------------------
   ARCHIVE — the full stills library behind the homepage marquee.
   `ratio` drives each tile's aspect box, which is what gives the masonry its
   varied rhythm instead of a uniform grid.
------------------------------------------------------------------------- */

export const ARCHIVE_CATEGORIES = [
    "All",
    "On set",
    "Location",
    "Portrait",
    "Post",
] as const;

export type ArchiveCategory = (typeof ARCHIVE_CATEGORIES)[number];

export type Shot = {
    id: string;
    title: string;
    project: string;
    category: Exclude<ArchiveCategory, "All">;
    ratio: string;
};

export const ARCHIVE: readonly Shot[] = [
    { id: "photo-1485846234645-a62644f84728", title: "Night unit, A-camera", project: "Green Waves", category: "On set", ratio: "3 / 2" },
    { id: "photo-1519741497674-611481863552", title: "Ceremony, available light", project: "Mystic Horizons", category: "Location", ratio: "2 / 3" },
    { id: "photo-1470071459604-3b5ec3a7fe05", title: "Valley fog at dawn", project: "Green Waves", category: "Location", ratio: "3 / 2" },
    { id: "photo-1516035069371-29a1b244cc32", title: "Key light test", project: "Mode Elite", category: "Portrait", ratio: "2 / 3" },
    { id: "photo-1574717024653-61fd2cf4d44d", title: "Grade suite, pass two", project: "Pixel Fusion", category: "Post", ratio: "3 / 2" },
    { id: "photo-1506744038136-46273834b3fb", title: "Lake reflection, wide", project: "EcoExplorer", category: "Location", ratio: "3 / 2" },
    { id: "photo-1522199755839-a2bacb67c546", title: "Pre-pro, board review", project: "Urban Uplift", category: "On set", ratio: "3 / 2" },
    { id: "photo-1533561052604-c3beb6d55b8d", title: "Handheld, rooftop", project: "Urban Uplift", category: "On set", ratio: "2 / 3" },
    { id: "photo-1520854221256-17451cc331bf", title: "Second unit, coast road", project: "Golden Hour", category: "Location", ratio: "3 / 2" },
    { id: "photo-1489599849927-2ee91cede3ba", title: "Screening, rough cut", project: "Pixel Fusion", category: "Post", ratio: "3 / 2" },
    { id: "photo-1465101162946-4377e57745c3", title: "Long lens, blue hour", project: "Golden Hour", category: "Location", ratio: "2 / 3" },
    { id: "photo-1470137237906-d8a4f71e1966", title: "Talent, natural key", project: "Mode Elite", category: "Portrait", ratio: "1 / 1" },
    { id: "photo-1511285560929-80b456fea0bc", title: "Reception, documentary", project: "Mystic Horizons", category: "Location", ratio: "3 / 2" },
    { id: "photo-1493863641943-9b68992a8d07", title: "Golden hour, 85mm", project: "Solaris", category: "Portrait", ratio: "2 / 3" },
    { id: "photo-1524504388940-b1c1722653e1", title: "Studio portrait, low key", project: "Mode Elite", category: "Portrait", ratio: "2 / 3" },
    { id: "photo-1579165466741-7f35e4755660", title: "Crew on playback", project: "In house", category: "On set", ratio: "3 / 2" },
    { id: "photo-1551434678-e076c223a692", title: "Interview setup, two-cam", project: "HorizonTech", category: "On set", ratio: "3 / 2" },
    { id: "photo-1478720568477-152d9b164e26", title: "Archive transfer", project: "Urban Uplift", category: "Post", ratio: "3 / 2" },
    { id: "photo-1500530855697-b586d89ba3ee", title: "Aerial, first light", project: "Green Waves", category: "Location", ratio: "3 / 2" },
    { id: "photo-1492691527719-9d1e07e534b4", title: "Campaign still, hero", project: "Mode Elite", category: "Portrait", ratio: "2 / 3" },
    { id: "photo-1493225457124-a3eb161ffa5f", title: "Stage two, night", project: "Techno", category: "On set", ratio: "3 / 2" },
    { id: "photo-1449824913935-59a10b8d2000", title: "City block, dusk", project: "MetroScape", category: "Location", ratio: "3 / 2" },
    { id: "photo-1500534623283-312aade485b7", title: "Desert, magic hour", project: "Solaris", category: "Location", ratio: "2 / 3" },
    { id: "photo-1550745165-9bc0b252726f", title: "Colour bay, night pass", project: "Techno", category: "Post", ratio: "1 / 1" },
    { id: "photo-1502720705749-871143f0e671", title: "Reportage, mid-ceremony", project: "Mystic Horizons", category: "Location", ratio: "3 / 2" },
    { id: "photo-1524253482453-3fed8d2fe12b", title: "Event coverage, wide", project: "Meridian", category: "On set", ratio: "3 / 2" },
    { id: "photo-1579165466949-3180a3d056d5", title: "Behind the scenes", project: "In house", category: "On set", ratio: "2 / 3" },
    { id: "photo-1494790108377-be9c29b29330", title: "Client portrait", project: "HorizonTech", category: "Portrait", ratio: "1 / 1" },
];

/* ---------------------------------------------------------------------------
   PROJECTS — the featured work on the homepage. Editable from /admin/work.
   The first entry renders as the large hero card.
------------------------------------------------------------------------- */

export type Project = {
    title: string;
    client: string;
    tag: string;
    year: string;
    image: string;
    featured?: boolean;
};

export const PROJECTS: Project[] = [
    {
        title: "Green Waves",
        client: "Eco-Warriors",
        tag: "Brand film",
        year: "2026",
        image: img("photo-1500530855697-b586d89ba3ee"),
        featured: true,
    },
    {
        title: "Mystic Horizons",
        client: "Mode Elite",
        tag: "Campaign",
        year: "2025",
        image: img("photo-1492691527719-9d1e07e534b4", "sm"),
    },
    {
        title: "Pixel Fusion",
        client: "Techno",
        tag: "Commercial",
        year: "2025",
        image: img("photo-1493225457124-a3eb161ffa5f", "sm"),
    },
    {
        title: "Urban Uplift",
        client: "MetroScape",
        tag: "Documentary",
        year: "2024",
        image: img("photo-1449824913935-59a10b8d2000", "sm"),
    },
    {
        title: "Golden Hour",
        client: "Solaris",
        tag: "Brand film",
        year: "2024",
        image: img("photo-1500534623283-312aade485b7", "sm"),
    },
];
