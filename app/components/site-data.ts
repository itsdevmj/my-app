// Central media + copy for Capture Studio. Swap URLs for real footage/photos.

const u = (id: string, w = 1200) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

// Cinematic sample clips (Pexels CDN, verified reachable). Replace with your reels.
export const VIDEOS = {
    hero: "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
    showreel:
        "https://videos.pexels.com/video-files/3129671/3129671-hd_1920_1080_30fps.mp4",
} as const;

export const HERO_POSTER = u("photo-1485846234645-a62644f84728", 1600);

// Hero yellow-card media
export const HERO_SUBJECT = u("photo-1492691527719-9d1e07e534b4", 1200);
export const HERO_THUMBS = [
    u("photo-1502720705749-871143f0e671", 300),
    u("photo-1516035069371-29a1b244cc32", 300),
];

// Brand partners strip
export const BRANDS = [
    "NOVA",
    "HORIZON",
    "PIXELCRAFT",
    "ECHO",
    "MERIDIAN",
    "LUMEN",
    "APEX",
    "VERTEX",
];

export type Project = {
    title: string;
    client: string;
    image: string;
};

export const PORTFOLIO: Project[] = [
    { title: "GreenWaves", client: "Eco-Warriors", image: u("photo-1500530855697-b586d89ba3ee") },
    { title: "Mystic Horizons", client: "ModeElite", image: u("photo-1492691527719-9d1e07e534b4") },
    { title: "Pixel Fusion", client: "Techno", image: u("photo-1493225457124-a3eb161ffa5f") },
    { title: "EcoExplorer", client: "GreenEarth", image: u("photo-1470071459604-3b5ec3a7fe05") },
    { title: "Urban Uplift", client: "MetroScape", image: u("photo-1449824913935-59a10b8d2000") },
    { title: "Golden Hour", client: "Solaris", image: u("photo-1500534623283-312aade485b7") },
];

// Marquee images (photography reel)
export const MARQUEE_TOP = [
    u("photo-1492691527719-9d1e07e534b4", 900),
    u("photo-1519741497674-611481863552", 900),
    u("photo-1511285560929-80b456fea0bc", 900),
    u("photo-1520854221256-17451cc331bf", 900),
    u("photo-1506744038136-46273834b3fb", 900),
];

export const MARQUEE_BOTTOM = [
    u("photo-1516035069371-29a1b244cc32", 900),
    u("photo-1470137237906-d8a4f71e1966", 900),
    u("photo-1465101162946-4377e57745c3", 900),
    u("photo-1493863641943-9b68992a8d07", 900),
    u("photo-1524504388940-b1c1722653e1", 900),
];

export type Step = {
    no: string;
    title: string;
    desc: string;
    image: string;
};

export const PROCESS: Step[] = [
    {
        no: "01",
        title: "Pre-Production",
        desc: "The pivotal planning phase: idea refinement, budgeting, scheduling and the meticulous organisation of every logistical detail before a single frame is shot.",
        image: u("photo-1522199755839-a2bacb67c546", 900),
    },
    {
        no: "02",
        title: "Production",
        desc: "The dynamic phase where the plan springs to life. Cameras roll, talent performs, and the creative vision is realised on set with precision.",
        image: u("photo-1579165466741-7f35e4755660", 900),
    },
    {
        no: "03",
        title: "Post-Production",
        desc: "Raw footage transformed into a refined, polished piece. Editing, sound design, colour and visual effects breathe life into the final story.",
        image: u("photo-1574717024653-61fd2cf4d44d", 900),
    },
];

export type Service = {
    title: string;
    desc: string;
    image: string;
};

export const SERVICES: Service[] = [
    {
        title: "Corporate Videos",
        desc: "Engaging content for businesses, from promotions to internal and training material that elevates your brand.",
        image: u("photo-1551434678-e076c223a692", 900),
    },
    {
        title: "Documentaries",
        desc: "Real-life stories brought to life. We inform, entertain and educate on diverse subjects with captivating clarity.",
        image: u("photo-1478720568477-152d9b164e26", 900),
    },
    {
        title: "Narrative Films",
        desc: "Immerse your audience in captivating stories, whether a short film or a full-length feature production.",
        image: u("photo-1489599849927-2ee91cede3ba", 900),
    },
    {
        title: "Commercials",
        desc: "Short, attention-grabbing videos that showcase your products, services or brand identity effectively.",
        image: u("photo-1492691527719-9d1e07e534b4", 900),
    },
    {
        title: "Shorts & Reels",
        desc: "On-trend social content designed for maximum impact and shareability across every platform.",
        image: u("photo-1533561052604-c3beb6d55b8d", 900),
    },
    {
        title: "Animation & VFX",
        desc: "Cutting-edge animation and visual effects for breathtaking moments in films, commercials and beyond.",
        image: u("photo-1550745165-9bc0b252726f", 900),
    },
];

export const STATS = [
    { value: 15, suffix: "+", label: "Years of experience" },
    { value: 200, suffix: "+", label: "Repeated clients" },
    { value: 478, suffix: "", label: "Completed projects" },
    { value: 350, suffix: "+", label: "Happy clients" },
];

export type Testimonial = {
    quote: string;
    name: string;
    role: string;
};

export const TESTIMONIALS: Testimonial[] = [
    {
        quote:
            "We are thrilled with our new brand films. The team was calm, patient and created a genuinely pleasant atmosphere. Everything came together seamlessly.",
        name: "Sarah Adams",
        role: "CMO, HorizonTech Solutions",
    },
    {
        quote:
            "Our experience with Capture Studio was outstanding. Their relaxed, patient approach led to the successful delivery of every corporate video we needed.",
        name: "Michael Lee",
        role: "Director of Sales, EcoGrowth",
    },
    {
        quote:
            "After a year of projects together, I'm consistently amazed by their professionalism, commitment and deep knowledge of the film and video industry.",
        name: "Emily Rodriguez",
        role: "Creative Director, BrightSights Media",
    },
    {
        quote:
            "Working with Capture Studio was a pleasure. Their ability to stay calm while creating a fantastic atmosphere resulted in exceptional results.",
        name: "David Chen",
        role: "CEO, Nexus Innovations",
    },
];

export const FAQS = [
    {
        q: "What services do you offer?",
        a: "Full-service video and photography production: brand films, commercials, documentaries, social content, event coverage, animation and VFX, plus the marketing strategy to distribute it.",
    },
    {
        q: "How much does video production cost?",
        a: "Every project is scoped individually. Budgets depend on scale, crew, locations and post-production. We'll build a package that fits your goals after a quick discovery call.",
    },
    {
        q: "How long does it take to produce a video?",
        a: "A typical brand film runs three to six weeks from kickoff to final delivery, depending on complexity. Fast-turn social edits can be delivered in days.",
    },
    {
        q: "Can you help with scriptwriting and storyboarding?",
        a: "Absolutely. Our pre-production team handles concept development, scripting and storyboarding so the vision is locked before we roll.",
    },
    {
        q: "Do you provide video marketing services?",
        a: "Yes. We craft the content and the campaign, from platform-native cuts to paid social strategy that turns views into measurable growth.",
    },
];

export type Post = {
    category: string;
    title: string;
    author: string;
    date: string;
    image: string;
};

export const POSTS: Post[] = [
    {
        category: "News",
        title: "Capture Studio's production career opportunities and upcoming event",
        author: "Michael Carter",
        date: "Aug 29, 2026",
        image: u("photo-1524253482453-3fed8d2fe12b", 900),
    },
    {
        category: "Tips & Tricks",
        title: "Mastering the art of storytelling: the power of narrative in video",
        author: "Michael Carter",
        date: "Oct 17, 2026",
        image: u("photo-1485846234645-a62644f84728", 900),
    },
    {
        category: "Stories",
        title: "Lights, camera, action: behind the scenes of a production shoot",
        author: "John Davis",
        date: "Oct 16, 2026",
        image: u("photo-1579165466949-3180a3d056d5", 900),
    },
];
