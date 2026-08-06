/* ===========================================================================
   SHOP — catalogue for shop.capturestudio.co
   ---------------------------------------------------------------------------
   The storefront is a separate surface with its own chrome, served from
   app/shop and rewritten onto the `shop.` subdomain by proxy.ts.

   Prices are in whole cents to avoid float rounding. Format with `price()`.
   ========================================================================= */

import { img } from "./site";

/**
 * Cross-property links. Locally both live on one origin, so these default to
 * plain paths; in production set them to the real hosts so the shop and the
 * studio site link across subdomains.
 *   NEXT_PUBLIC_SHOP_URL=https://shop.capturestudio.co
 *   NEXT_PUBLIC_STUDIO_URL=https://capturestudio.co
 */
export const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL ?? "/shop";
export const STUDIO_URL = process.env.NEXT_PUBLIC_STUDIO_URL ?? "/";

export const SHOP_CATEGORIES = [
    "All",
    "Grading",
    "Sound",
    "Prints",
    "Books",
    "Merch",
] as const;

export type ShopCategory = (typeof SHOP_CATEGORIES)[number];

export type Product = {
    handle: string;
    name: string;
    tagline: string;
    category: Exclude<ShopCategory, "All">;
    /** Whole cents. */
    cents: number;
    compareAtCents?: number;
    badge?: string;
    /** Digital goods skip shipping copy and size pickers. */
    digital: boolean;
    images: readonly string[];
    description: string;
    includes: readonly string[];
    /** Variant axis. Digital products use licence tiers, physical use sizes. */
    optionLabel: string;
    options: readonly string[];
    inStock: boolean;
};

export const PRODUCTS: readonly Product[] = [
    {
        handle: "halide-lut-pack",
        name: "Halide LUT Pack",
        tagline: "24 film emulations, built on our own scans",
        category: "Grading",
        cents: 8900,
        compareAtCents: 12000,
        badge: "Best seller",
        digital: true,
        images: [
            img("photo-1574717024653-61fd2cf4d44d"),
            img("photo-1550745165-9bc0b252726f", "sm"),
            img("photo-1489599849927-2ee91cede3ba", "sm"),
        ],
        description:
            "The grade set we actually use. Twenty-four looks derived from real stock scans, profiled for log footage and built to hold skin tones when you push them. Every LUT ships in .cube and .look, with a Resolve powergrade version for the ones that need a node tree.",
        includes: [
            "24 × .cube LUTs (33³ and 65³)",
            "Resolve powergrades for 6 hero looks",
            "Log and Rec.709 variants",
            "Reference stills and a setup guide",
        ],
        optionLabel: "Licence",
        options: ["Single seat", "Studio (up to 5)", "Unlimited"],
        inStock: true,
    },
    {
        handle: "nightshift-lut-pack",
        name: "Nightshift LUT Pack",
        tagline: "Low-light grades that keep the blacks clean",
        category: "Grading",
        cents: 6900,
        digital: true,
        images: [
            img("photo-1485846234645-a62644f84728"),
            img("photo-1493225457124-a3eb161ffa5f", "sm"),
            img("photo-1465101162946-4377e57745c3", "sm"),
        ],
        description:
            "Built during a run of night shoots where nothing off the shelf held up. Twelve looks tuned for high-ISO footage, with noise-aware contrast curves that lift shadows without turning them into mud.",
        includes: [
            "12 × .cube LUTs",
            "High-ISO contrast curves",
            "Halation and bloom overlays",
            "Before/after reference frames",
        ],
        optionLabel: "Licence",
        options: ["Single seat", "Studio (up to 5)", "Unlimited"],
        inStock: true,
    },
    {
        handle: "grain-halation-pack",
        name: "Grain & Halation Pack",
        tagline: "4K scans of real stock, not generated noise",
        category: "Grading",
        cents: 4900,
        digital: true,
        images: [
            img("photo-1478720568477-152d9b164e26"),
            img("photo-1522199755839-a2bacb67c546", "sm"),
        ],
        description:
            "We scanned clean stock at 4K so you can overlay genuine grain instead of faking it in software. Eight stocks, each as a loopable plate long enough that the pattern never visibly repeats in a normal cut.",
        includes: [
            "8 grain plates, 4K ProRes 4444",
            "3 halation passes",
            "Gate weave and flicker loops",
            "Premiere and Resolve presets",
        ],
        optionLabel: "Licence",
        options: ["Single seat", "Studio (up to 5)", "Unlimited"],
        inStock: true,
    },
    {
        handle: "field-sound-library",
        name: "Field Sound Library Vol. 1",
        tagline: "320 location recordings from sixteen years of shoots",
        category: "Sound",
        cents: 12900,
        badge: "New",
        digital: true,
        images: [
            img("photo-1520854221256-17451cc331bf"),
            img("photo-1511285560929-80b456fea0bc", "sm"),
        ],
        description:
            "Every location we shot, we also recorded. This is the cleaned-up half of that archive: rooms, streets, weather, machinery and crowds, captured at 96kHz on a proper rig rather than a camera mic.",
        includes: [
            "320 files, 96kHz / 24-bit WAV",
            "Metadata tagged for Soundminer",
            "Stereo and ambisonic variants",
            "Cleared for commercial use",
        ],
        optionLabel: "Licence",
        options: ["Single seat", "Studio (up to 5)", "Unlimited"],
        inStock: true,
    },
    {
        handle: "golden-hour-print",
        name: "Golden Hour",
        tagline: "Archival pigment print, Mojave, 2024",
        category: "Prints",
        cents: 18000,
        digital: false,
        images: [
            img("photo-1500534623283-312aade485b7"),
            img("photo-1493863641943-9b68992a8d07", "sm"),
        ],
        description:
            "Shot on the last frame of the day at the end of the Solaris campaign. Printed on 310gsm cotton rag with pigment inks, hand-numbered in an edition of 50, and shipped flat rather than rolled.",
        includes: [
            "310gsm archival cotton rag",
            "Edition of 50, hand-numbered",
            "Signed certificate of authenticity",
            "Shipped flat, insured",
        ],
        optionLabel: "Size",
        options: ["A3 — 297 × 420mm", "A2 — 420 × 594mm", "A1 — 594 × 841mm"],
        inStock: true,
    },
    {
        handle: "valley-fog-print",
        name: "Valley Fog",
        tagline: "Archival pigment print, Big Sur, 2026",
        category: "Prints",
        cents: 18000,
        digital: false,
        images: [
            img("photo-1470071459604-3b5ec3a7fe05"),
            img("photo-1506744038136-46273834b3fb", "sm"),
        ],
        description:
            "Taken at 5:40am on the Green Waves shoot, waiting for a sunrise that never properly arrived. The fog did the work instead. Same print stock and edition structure as the rest of the series.",
        includes: [
            "310gsm archival cotton rag",
            "Edition of 50, hand-numbered",
            "Signed certificate of authenticity",
            "Shipped flat, insured",
        ],
        optionLabel: "Size",
        options: ["A3 — 297 × 420mm", "A2 — 420 × 594mm", "A1 — 594 × 841mm"],
        inStock: true,
    },
    {
        handle: "night-unit-print",
        name: "Night Unit",
        tagline: "Archival pigment print, Iceland, 2025",
        category: "Prints",
        cents: 16000,
        digital: false,
        images: [
            img("photo-1519741497674-611481863552"),
            img("photo-1533561052604-c3beb6d55b8d", "sm"),
        ],
        description:
            "The A-camera team setting up a dolly move at two in the morning, lit almost entirely by the truck. One of the few behind-the-scenes frames we thought was worth printing.",
        includes: [
            "310gsm archival cotton rag",
            "Edition of 75, hand-numbered",
            "Signed certificate of authenticity",
            "Shipped flat, insured",
        ],
        optionLabel: "Size",
        options: ["A3 — 297 × 420mm", "A2 — 420 × 594mm"],
        inStock: false,
    },
    {
        handle: "frames-book",
        name: "Frames",
        tagline: "240pp hardcover, sixteen years of stills",
        category: "Books",
        cents: 6500,
        badge: "Signed",
        digital: false,
        images: [
            img("photo-1524504388940-b1c1722653e1"),
            img("photo-1478720568477-152d9b164e26", "sm"),
        ],
        description:
            "The archive, edited down and printed properly. 240 pages, section-sewn so it opens flat, with production notes on the shoots that mattered. First run of 500, each signed by the directors.",
        includes: [
            "240pp, 240 × 300mm hardcover",
            "Section-sewn, opens flat",
            "Signed first run of 500",
            "Production notes throughout",
        ],
        optionLabel: "Edition",
        options: ["Standard", "Signed first run"],
        inStock: true,
    },
    {
        handle: "crew-tee",
        name: "Crew Tee",
        tagline: "The shirt we actually wear on set",
        category: "Merch",
        cents: 4200,
        digital: false,
        images: [
            img("photo-1516035069371-29a1b244cc32"),
            img("photo-1470137237906-d8a4f71e1966", "sm"),
        ],
        description:
            "Heavyweight 240gsm cotton, boxy cut, screen printed one colour on the chest and small on the back. Black only, because that is what you wear on a set.",
        includes: [
            "240gsm combed cotton",
            "Boxy, pre-shrunk fit",
            "One-colour screen print",
            "Ships in 2–4 days",
        ],
        optionLabel: "Size",
        options: ["S", "M", "L", "XL", "XXL"],
        inStock: true,
    },
    {
        handle: "field-cap",
        name: "Field Cap",
        tagline: "Unstructured six-panel, low profile",
        category: "Merch",
        cents: 3800,
        digital: false,
        images: [
            img("photo-1524253482453-3fed8d2fe12b"),
            img("photo-1579165466949-3180a3d056d5", "sm"),
        ],
        description:
            "Unstructured so it packs flat in a camera bag, with a low crown that stays out of the eyepiece. Embroidered mark, brass buckle closure.",
        includes: [
            "Washed cotton twill",
            "Unstructured six-panel",
            "Embroidered mark",
            "One size, adjustable",
        ],
        optionLabel: "Colour",
        options: ["Black", "Sand"],
        inStock: true,
    },
    {
        handle: "camera-tape-set",
        name: "Camera Tape, 3-pack",
        tagline: "Yellow, white, black — the only three you need",
        category: "Merch",
        cents: 1800,
        digital: false,
        images: [
            img("photo-1579165466741-7f35e4755660"),
            img("photo-1551434678-e076c223a692", "sm"),
        ],
        description:
            "One inch, low residue, tears clean by hand. The yellow is the same yellow as everything else we make, which is either a nice detail or a branding exercise depending on how cynical you are.",
        includes: [
            "3 rolls, 1in × 30yd",
            "Low-residue adhesive",
            "Tears clean, no scissors",
            "Yellow, white, black",
        ],
        optionLabel: "Pack",
        options: ["Single 3-pack", "Case of 6"],
        inStock: true,
    },
    {
        handle: "transitions-pack",
        name: "In-Camera Transitions",
        tagline: "42 practical whips, wipes and light hits",
        category: "Grading",
        cents: 3900,
        digital: true,
        images: [
            img("photo-1489599849927-2ee91cede3ba"),
            img("photo-1550745165-9bc0b252726f", "sm"),
        ],
        description:
            "Shot on a stage over two days with real lenses and real lights, so they cut together with actual footage instead of looking like a plugin. Alpha-matted where it matters.",
        includes: [
            "42 clips, 4K ProRes 4444",
            "Alpha channels included",
            "Premiere and Resolve bins",
            "Matching whoosh SFX",
        ],
        optionLabel: "Licence",
        options: ["Single seat", "Studio (up to 5)", "Unlimited"],
        inStock: true,
    },
];

/* ---------------------------------------------------------------------------
   HELPERS
------------------------------------------------------------------------- */

const FORMATTER = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
});

/** Cents → "$89". Rounded because every price here is whole dollars. */
export const price = (cents: number) => FORMATTER.format(cents / 100);

export const findProduct = (handle: string) =>
    PRODUCTS.find((p) => p.handle === handle);

export const countIn = (category: ShopCategory) =>
    category === "All"
        ? PRODUCTS.length
        : PRODUCTS.filter((p) => p.category === category).length;
