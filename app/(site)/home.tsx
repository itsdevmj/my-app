"use client";

/* ===========================================================================
   CAPTURE STUDIO — homepage
   ---------------------------------------------------------------------------
   Modern, dark, media-forward. No theme concept: a conventional, immediately
   legible structure, with the quality coming from execution.

     Nav        floating frosted bar
     Hero       full-bleed reel, headline, two CTAs, proof strip
     Clients    quiet logo marquee
     Work       large media cards, metadata revealed on hover
     Services   bento grid — one feature tile plus supporting tiles
     Studio     stats band and positioning
     Process    three stages, elevated
     Voices     two-up testimonial panels
     CTA        accent band
     Footer     organised, multi-column

   Motion is deliberate and sparse: media parallax in the hero, one soft
   fade-and-rise on section entry, hover scale on media. All of it respects
   prefers-reduced-motion.
   ========================================================================= */

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";
import {
  ButtonGhost,
  ButtonPrimary,
  EASE,
  Eyebrow,
  Rise,
  SectionHeading,
  Shell,
} from "@/app/components/site-ui";
import { img, type Project } from "@/app/lib/site";
import type { StudioSettings } from "@/app/lib/content-store";

/* ---------------------------------------------------------------------------
   CONTENT
------------------------------------------------------------------------- */

const REEL = {
  src: "https://videos.pexels.com/video-files/3195394/3195394-hd_1920_1080_25fps.mp4",
  poster: img("photo-1485846234645-a62644f84728"),
} as const;

const PROOF = [
  { value: "15+", label: "Years producing" },
  { value: "478", label: "Films delivered" },
  { value: "32", label: "Awards & selections" },
] as const;

const CLIENTS = [
  "Nova", "Horizon", "Pixelcraft", "Echo", "Meridian",
  "Lumen", "Apex", "Vertex", "Solaris", "MetroScape",
] as const;

/* The wall of stills. Two rows marqueeing horizontally in opposite
   directions: the top row drifts left, the bottom row drifts right. The
   durations are deliberately not multiples of each other, so the two rows
   never resync into a visible repeating pattern. */
const FRAME_ROWS = [
  {
    reverse: false, // drifts left
    duration: "71s",
    ids: [
      "photo-1519741497674-611481863552",
      "photo-1470071459604-3b5ec3a7fe05",
      "photo-1506744038136-46273834b3fb",
      "photo-1533561052604-c3beb6d55b8d",
      "photo-1516035069371-29a1b244cc32",
      "photo-1520854221256-17451cc331bf",
    ],
  },
  {
    reverse: true, // drifts right
    duration: "89s",
    ids: [
      "photo-1489599849927-2ee91cede3ba",
      "photo-1465101162946-4377e57745c3",
      "photo-1511285560929-80b456fea0bc",
      "photo-1470137237906-d8a4f71e1966",
      "photo-1522199755839-a2bacb67c546",
      "photo-1524504388940-b1c1722653e1",
    ],
  },
] as const;

const SERVICES = [
  {
    title: "Brand films",
    body: "The centrepiece film that explains who you are and why it matters. Directed, shot and finished by our own team.",
    image: img("photo-1551434678-e076c223a692", "sm"),
    featured: true,
  },
  { title: "Commercials", body: "Broadcast and online spots built to hold attention in the first three seconds." },
  { title: "Documentary", body: "Long-form storytelling for brands with something real to say." },
  { title: "Photography", body: "Campaign and product stills captured on the same schedule as motion." },
  { title: "Social content", body: "Platform-native vertical cuts designed for the feed, not retrofitted to it." },
  { title: "Animation & VFX", body: "Motion graphics, titles and clean-up finished in house." },
] as const;

const PROCESS = [
  {
    step: "01",
    title: "Discover",
    body: "We start with the objective, not the shot list. Audience, message, channels and budget get settled before anything is scheduled.",
  },
  {
    step: "02",
    title: "Produce",
    body: "Casting, locations, crew and kit. You approve the treatment, then our unit shoots it with the people who pitched it.",
  },
  {
    step: "03",
    title: "Deliver",
    body: "Edit, sound, colour and every cut-down you need, in the formats each platform actually wants.",
  },
] as const;

const VOICES = [
  {
    quote:
      "They arrived with a plan, adapted when the location fell through, and still delivered a film that outperformed everything we had run before.",
    name: "Sarah Adams",
    role: "CMO, HorizonTech",
    image: img("photo-1494790108377-be9c29b29330", "sm"),
  },
  {
    quote:
      "Eleven projects in three years. The schedule has never slipped, and the strategy work is what genuinely separates them from other shops.",
    name: "Michael Lee",
    role: "Director of Sales, EcoGrowth",
    image: img("photo-1507003211169-0a1dd7228f2d", "sm"),
  },
] as const;

/* ---------------------------------------------------------------------------
   HERO
------------------------------------------------------------------------- */

function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();

  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  /* Pointer parallax. Two layers at different depths, spring-smoothed so it
     glides instead of tracking the cursor rigidly. Fine pointers only. */
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const spring = { stiffness: 90, damping: 20, mass: 0.6 };
  const reelX = useSpring(useTransform(px, [-1, 1], [-14, 14]), spring);
  const reelY = useSpring(useTransform(py, [-1, 1], [-10, 10]), spring);
  const stillX = useSpring(useTransform(px, [-1, 1], [30, -30]), spring);
  const stillY = useSpring(useTransform(py, [-1, 1], [20, -20]), spring);

  const onPointerMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width) * 2 - 1);
    py.set(((e.clientY - r.top) / r.height) * 2 - 1);
  };

  const resetPointer = () => {
    px.set(0);
    py.set(0);
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  };

  const enter = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: EASE },
  });

  return (
    <section
      id="top"
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={resetPointer}
      className="bloom relative flex min-h-[100svh] items-center overflow-hidden pb-16 pt-28 sm:pt-32"
    >
      <Shell>
        <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
          {/* ---- copy ---- */}
          <div className="lg:col-span-5">
            <motion.h1
              {...enter(0)}
              className="h-display text-[clamp(2.5rem,6vw,4.25rem)]"
            >
              Films that earn{" "}
              <span className="text-accent">attention</span>, not just views.
            </motion.h1>

            <motion.p {...enter(0.08)} className="lede mt-6 max-w-md">
              Brand films, commercials and campaign content for companies with
              something worth saying. Crewed, shot and finished by one team.
            </motion.p>

            <motion.div {...enter(0.16)} className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonPrimary href="#work">
                See our work
                <span aria-hidden>→</span>
              </ButtonPrimary>
              <ButtonGhost href="#contact">Book a call</ButtonGhost>
            </motion.div>

            <motion.dl
              {...enter(0.24)}
              className="mt-12 flex flex-wrap gap-x-10 gap-y-5 border-t border-line pt-6"
            >
              {PROOF.map((item) => (
                <div key={item.label}>
                  <dd className="h-section text-2xl sm:text-3xl">{item.value}</dd>
                  <dt className="mt-1 text-[13px] text-fg-dim">{item.label}</dt>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ---- media ---- */}
          <motion.div
            {...enter(0.2)}
            className="relative lg:col-span-7 lg:pl-6"
          >
            {/* the reel, sharp and framed rather than washed out behind text */}
            <motion.div
              style={reduce ? undefined : { x: reelX, y: reelY }}
              className="media relative aspect-[4/3] rounded-xl sm:aspect-[16/10]"
            >
              <video
                ref={videoRef}
                className="h-full w-full object-cover"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                poster={REEL.poster}
                aria-label="Capture Studio showreel"
              >
                <source src={REEL.src} type="video/mp4" />
              </video>

              {/* just enough falloff for the chips to read */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-bg/20" />

              <span className="glass absolute left-4 top-4 flex items-center gap-2 rounded-full px-3 py-1.5">
                <span className="relative flex size-1.5">
                  <span className="absolute inset-0 animate-ping rounded-full bg-accent" />
                  <span className="relative size-1.5 rounded-full bg-accent" />
                </span>
                <span className="text-[11px] font-bold tracking-tight">Showreel 2026</span>
              </span>

              <button
                type="button"
                onClick={toggleMute}
                className="glass absolute bottom-4 right-4 rounded-full px-4 py-2 text-[11px] font-bold tracking-tight transition-colors duration-200 hover:bg-accent hover:text-accent-fg"
              >
                {muted ? "Sound off" : "Sound on"}
              </button>

              <span className="absolute bottom-4 left-4 text-[11px] font-bold tracking-tight text-fg-muted">
                02:14
              </span>
            </motion.div>

            {/* offset still, drifting the opposite way for depth */}
            <motion.div
              aria-hidden
              style={reduce ? undefined : { x: stillX, y: stillY }}
              className="panel absolute -bottom-8 -left-2 hidden w-36 overflow-hidden rounded-lg sm:block lg:-left-4 lg:w-44"
            >
              <div className="media relative aspect-[3/4] rounded-none border-0">
                <Image
                  src={img("photo-1516035069371-29a1b244cc32", "sm")}
                  alt=""
                  fill
                  sizes="176px"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   FRAMES — the wall of stills. Columns loop vertically at different speeds so
   it is always in motion, and the whole thing pauses on hover so people can
   actually look. Scroll adds a second, slower layer of drift.
------------------------------------------------------------------------- */

function Frames() {
  return (
    <section className="relative overflow-hidden border-t border-line py-24 sm:py-32">
      <Shell>
        <SectionHeading
          eyebrow="The archive"
          title="Frames worth keeping"
          body="A slice of what we've shot on location, on set and in the grade suite. Hover to hold it still."
          action={<ButtonGhost href="/archive">See more frames</ButtonGhost>}
        />
      </Shell>

      {/* Full bleed on purpose: the rows should run off both edges rather than
          stopping politely inside the content column. */}
      <div className="frames-wall fade-x mt-14 flex flex-col gap-4 sm:gap-5">
        {FRAME_ROWS.map((row, r) => {
          /* images listed twice so the -50% translate lands on the copy */
          const cells = [...row.ids, ...row.ids];
          return (
            <div key={`row-${r}`} className="flex overflow-hidden">
              <div
                className={`row-loop flex w-max gap-4 sm:gap-5 ${row.reverse ? "row-right" : ""
                  }`}
                style={{ animationDuration: row.duration }}
              >
                {cells.map((id, i) => (
                  <div
                    key={`${id}-${i}`}
                    className="media group relative h-48 w-72 shrink-0 rounded-lg sm:h-60 sm:w-96 lg:h-72 lg:w-[30rem]"
                  >
                    <Image
                      src={img(id, "sm")}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 288px, (max-width: 1024px) 384px, 480px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CLIENTS
------------------------------------------------------------------------- */

function Clients() {
  const row = [...CLIENTS, ...CLIENTS];
  return (
    <section className="border-y border-line py-10" aria-label="Selected clients">
      <p className="eyebrow mb-7 text-center text-fg-dim">
        Trusted by teams at
      </p>
      <div className="relative flex overflow-hidden">
        <div className="drift-track flex shrink-0 animate-drift items-center gap-14 pr-14">
          {row.map((client, i) => (
            <span
              key={`${client}-${i}`}
              className="shrink-0 text-2xl font-extrabold tracking-tight text-fg-dim/50 transition-colors duration-300 hover:text-fg"
            >
              {client}
            </span>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-bg to-transparent sm:w-32" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-bg to-transparent sm:w-32" />
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   WORK — one featured card, then a supporting grid. Metadata rides up on
   hover; on touch it is simply always visible.
------------------------------------------------------------------------- */

function ProjectCard({
  project,
  featured = false,
  priority = false,
}: {
  project: Project;
  featured?: boolean;
  priority?: boolean;
}) {
  return (
    <a
      href="#contact"
      className="group relative block overflow-hidden rounded-xl"
      aria-label={`${project.title} for ${project.client}`}
    >
      <div
        className={`media relative rounded-xl ${featured ? "aspect-[16/10]" : "aspect-[4/3]"
          }`}
      >
        <Image
          src={project.image}
          alt={`${project.title} — ${project.tag} for ${project.client}`}
          fill
          priority={priority}
          sizes={featured ? "(max-width: 1024px) 100vw, 66vw" : "(max-width: 640px) 100vw, 33vw"}
          className="media-zoom object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent opacity-90" />
      </div>

      {/* tag chip */}
      <span className="glass absolute left-4 top-4 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-tight">
        {project.tag}
      </span>

      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-accent">{project.client}</p>
          <h3
            className={`h-section mt-1.5 truncate ${featured ? "text-3xl sm:text-4xl" : "text-xl sm:text-2xl"
              }`}
          >
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-fg-dim opacity-100 transition-opacity duration-500 lg:opacity-0 lg:group-hover:opacity-100">
            {project.year} · Watch the film
          </p>
        </div>
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-accent-fg transition-transform duration-500 group-hover:rotate-45">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M7 17 17 7M17 7H8M17 7v9" />
          </svg>
        </span>
      </div>
    </a>
  );
}

function Work({ projects }: { projects: Project[] }) {
  const [featured, ...rest] = projects;

  return (
    <section id="work" className="scroll-mt-24 py-24 sm:py-32">
      <Shell>
        <SectionHeading
          eyebrow="Selected work"
          title={
            <>
              Recent films we&apos;re
              <br className="hidden sm:block" /> proud of
            </>
          }
          body="A short selection across brand, commercial and documentary work. Full case studies available on request."
          action={<ButtonGhost href="#contact">View all projects</ButtonGhost>}
        />

        <Rise className="mt-14">
          <ProjectCard project={featured} featured priority />
        </Rise>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((project, i) => (
            <Rise key={project.title} delay={i * 0.06}>
              <ProjectCard project={project} />
            </Rise>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   SERVICES — bento: one image-led feature tile plus five compact tiles.
   Deliberately not three identical icon cards.
------------------------------------------------------------------------- */

function Services() {
  const [feature, ...rest] = SERVICES;

  return (
    <section id="services" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <Shell>
        <SectionHeading
          eyebrow="What we do"
          title="Everything from the first idea to the final cut"
          body="One team covering strategy, production and post, so nothing gets lost in a handoff to a third party."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {/* feature tile */}
          <Rise className="lg:col-span-2">
            <article className="panel group relative flex h-full flex-col overflow-hidden rounded-xl">
              <div className="media relative aspect-[16/9] rounded-none border-0 border-b border-line">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="media-zoom object-cover opacity-85"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent" />
              </div>
              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <h3 className="h-section text-2xl sm:text-3xl">{feature.title}</h3>
                <p className="mt-3 max-w-md text-[15px] leading-relaxed text-fg-muted">
                  {feature.body}
                </p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
                  Most requested
                </span>
              </div>
            </article>
          </Rise>

          {/* compact tiles */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
            {rest.slice(0, 2).map((service, i) => (
              <Rise key={service.title} delay={i * 0.06}>
                <article className="panel h-full rounded-xl p-6">
                  <h3 className="text-lg font-extrabold tracking-tight">{service.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{service.body}</p>
                </article>
              </Rise>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.slice(2).map((service, i) => (
            <Rise key={service.title} delay={i * 0.06}>
              <article className="panel h-full rounded-xl p-6">
                <h3 className="text-lg font-extrabold tracking-tight">{service.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{service.body}</p>
              </article>
            </Rise>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   STUDIO
------------------------------------------------------------------------- */

function Studio() {
  return (
    <section id="studio" className="scroll-mt-24 border-t border-line py-24 sm:py-32">
      <Shell>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Rise>
            <div className="media relative aspect-[4/3] rounded-xl">
              <Image
                src={img("photo-1579165466741-7f35e4755660")}
                alt="The Capture Studio crew reviewing playback on set"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Rise>

          <Rise delay={0.08}>
            <Eyebrow>The studio</Eyebrow>
            <h2 className="h-section mt-5 text-4xl sm:text-5xl">
              A small team, on purpose
            </h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-fg-muted sm:text-base">
              <p>
                Capture Studio opened in 2011 with one camera and a stubborn
                belief that most brand video fails for an unglamorous reason:
                nobody decided what it was for. We start there instead.
              </p>
              <p>
                Fourteen people now — directors, DOPs, editors, a colourist and
                a strategist. Small enough that the people who pitch your
                project are the people who shoot it.
              </p>
            </div>

            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-8">
              {[
                { value: "In house", label: "Edit, colour & sound" },
                { value: "Worldwide", label: "Travel & production" },
                { value: "4–6 wks", label: "Typical turnaround" },
                { value: "$2M", label: "Insured & certified" },
              ].map((item) => (
                <div key={item.label} className="border-t border-line pt-4">
                  <dt className="text-xl font-extrabold tracking-tight sm:text-2xl">
                    {item.value}
                  </dt>
                  <dd className="mt-1 text-sm text-fg-dim">{item.label}</dd>
                </div>
              ))}
            </dl>
          </Rise>
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   PROCESS
------------------------------------------------------------------------- */

function Process() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Shell>
        <SectionHeading
          eyebrow="How it works"
          title="Three stages, no surprises"
          body="You see and approve the work at every gate, and the final invoice matches the one you signed off."
        />

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PROCESS.map((stage, i) => (
            <Rise key={stage.step} delay={i * 0.08}>
              <article className="panel relative h-full overflow-hidden rounded-xl p-7 sm:p-8">
                <span
                  aria-hidden
                  className="absolute right-5 top-4 text-6xl font-extrabold tracking-tighter text-surface-3"
                >
                  {stage.step}
                </span>
                <span className="grid size-10 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-fg">
                  {i + 1}
                </span>
                <h3 className="h-section mt-6 text-2xl">{stage.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-fg-muted">
                  {stage.body}
                </p>
              </article>
            </Rise>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   VOICES — two panels, both visible. No carousel.
------------------------------------------------------------------------- */

function Voices() {
  return (
    <section className="border-t border-line py-24 sm:py-32">
      <Shell>
        <SectionHeading eyebrow="Client feedback" title="What it's like to work with us" />

        <div className="mt-14 grid gap-5 lg:grid-cols-2">
          {VOICES.map((voice, i) => (
            <Rise key={voice.name} delay={i * 0.08}>
              <figure className="panel flex h-full flex-col rounded-xl p-7 sm:p-9">
                <svg
                  aria-hidden
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  className="fill-accent"
                >
                  <path d="M7.5 11H4.8c0-2.5 1-4 3.2-4.6V4C4.5 4.7 2.5 7.2 2.5 11.3V20h7.4v-9H7.5Zm11 0h-2.7c0-2.5 1-4 3.2-4.6V4c-3.5.7-5.5 3.2-5.5 7.3V20h7.4v-9h-2.4Z" />
                </svg>
                <blockquote className="mt-6 flex-1 text-lg leading-relaxed sm:text-xl">
                  {voice.quote}
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3.5 border-t border-line pt-6">
                  <span className="media relative size-11 shrink-0 rounded-full">
                    <Image
                      src={voice.image}
                      alt=""
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-extrabold tracking-tight">
                      {voice.name}
                    </span>
                    <span className="block text-sm text-fg-dim">{voice.role}</span>
                  </span>
                </figcaption>
              </figure>
            </Rise>
          ))}
        </div>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   CTA
------------------------------------------------------------------------- */

function CTA({ studio }: { studio: StudioSettings }) {
  return (
    <section id="contact" className="scroll-mt-24 py-24 sm:py-32">
      <Shell>
        <Rise>
          <div className="relative overflow-hidden rounded-2xl bg-accent px-6 py-16 text-center text-accent-fg sm:px-12 sm:py-20">
            <h2 className="h-display mx-auto max-w-3xl text-[clamp(2.25rem,5.5vw,4rem)]">
              Let&apos;s make something worth watching
            </h2>
            <p className="mx-auto mt-6 max-w-lg text-base leading-relaxed text-accent-fg/75 sm:text-lg">
              Tell us what the film has to achieve and who needs to see it. A
              budget range gets you an honest answer about scope.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <a
                href={`mailto:${studio.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-accent-fg px-7 py-4 text-sm font-bold tracking-tight text-fg transition-transform duration-300 hover:scale-[1.03]"
              >
                {studio.email}
                <span aria-hidden>→</span>
              </a>
              <a
                href={`tel:${studio.phone.replace(/[^+\d]/g, "")}`}
                className="inline-flex items-center rounded-full border border-accent-fg/25 px-7 py-4 text-sm font-bold tracking-tight transition-colors duration-300 hover:border-accent-fg"
              >
                {studio.phone}
              </a>
            </div>

            <p className="mt-8 text-sm font-semibold text-accent-fg/60">
              We reply to every brief, including the ones we turn down.
            </p>
          </div>
        </Rise>
      </Shell>
    </section>
  );
}

/* ---------------------------------------------------------------------------
   PAGE
------------------------------------------------------------------------- */

export default function Home({
  projects,
  studio,
}: {
  /** Live, database-backed content, passed down from the server page. */
  projects: Project[];
  studio: StudioSettings;
}) {
  return (
    <>
      <main>
        <Hero />
        <Clients />
        <Work projects={projects} />
        <Frames />
        <Services />
        <Studio />
        <Process />
        <Voices />
        <CTA studio={studio} />
      </main>
    </>
  );
}
