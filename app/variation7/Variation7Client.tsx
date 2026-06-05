"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";

import { AuroraBackground } from "@/components/backgrounds/AuroraBackground";
import { AtAGlanceFloatingPaths } from "@/components/backgrounds/FloatingPaths";
import GameOfLife from "@/components/backgrounds/GameOfLife";
import OpenNetworkAnimation from "@/components/backgrounds/OpenNetworkAnimation";
import TreeAnimation from "@/components/backgrounds/TreeAnimation";
import { FlickeringGrid } from "@/components/effects/FlickeringGrid";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import {
  HeroColumnStagger,
  HeroEntrance,
  HeroLineItem,
  HeroStaggerChild,
  HeroStaggerRoot,
} from "@/components/hero/HeroEntrance";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { StaggerItem, StaggerOnView } from "@/components/hero/StaggerOnView";
import { Container } from "@/components/ui";
import { SOCIAL_X_URL } from "@/lib/site";

// ── Palette ───────────────────────────────────────────────────────────────────────
const WHITE = "#ffffff";
const INK = "#111111";
const RULE = "#d8d8d8";
const MUTED_TEXT = "#666666";
const AMBER = "#BC7C3C";
const DARK_SECTION = "#0e0e0e";

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: AMBER }}>{children}</span>;
}

// ── Data ────────────────────────────────────────────────────────────────────────
const team = [
  {
    handle: "Feuter",
    image: "/feuter.jpg",
    role: "Analytics & company research",
    city: "Singapore",
    xUrl: "https://x.com/feuters",
    blurb:
      "Graduate training with VC exposure, specializing in analytics, financial modeling, and company analysis. Former operator with direct experience building and running a business.",
    Bg: null,
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background with hands-on engineering experience across multiple startup stacks. Evaluates architecture, crafts automations and reviews implementation directly.",
    Bg: null,
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────────
function FigLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="mb-6 block font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
      style={{ color: MUTED_TEXT }}
    >
      {children}
    </span>
  );
}

function SectionNum({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="font-mono text-[clamp(3rem,7vw,5.5rem)] font-normal leading-none select-none"
      style={{ color: "rgba(17,17,17,0.12)" }}
    >
      {children}
    </span>
  );
}

function SubNum({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs" style={{ color: "rgba(17,17,17,0.3)" }}>
      {children}
    </span>
  );
}

function MonoBtn({
  children,
  variant = "primary",
  href,
}: {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  href?: string;
}) {
  const base =
    "inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] px-5 py-2.5 transition-colors";
  const styles =
    variant === "primary"
      ? "bg-[#111111] text-white hover:bg-[#333333]"
      : "bg-white text-[#111111] border border-[#d8d8d8] hover:border-[#111111]";

  const className = `${base} ${styles}`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="opacity-50">
          <path d="M1 11L11 1M11 1H3M11 1V9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </Link>
    );
  }

  return <span className={className}>{children}</span>;
}

// ── Scroll Progress Bar ────────────────────────────────────────────────────────
function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-[60] h-[2px] origin-left"
      style={{
        scaleX,
        background: "linear-gradient(90deg, #BC7C3C, #e8a85c)",
      }}
    />
  );
}

// ── Video Hero Section ────────────────────────────────────────────────────────
function VideoHeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.playsInline = true;

    const tryPlay = () => {
      v.play().catch(() => {});
    };

    tryPlay();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            tryPlay();
          }
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(v);

    const unlock = () => {
      tryPlay();
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
    document.addEventListener("click", unlock, { once: true });
    document.addEventListener("touchstart", unlock, { once: true });

    return () => {
      observer.disconnect();
      document.removeEventListener("click", unlock);
      document.removeEventListener("touchstart", unlock);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-svh flex-col justify-center overflow-hidden"
    >
      <motion.div className="absolute inset-0 z-0" style={{ scale: videoScale }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster="/hero-poster.jpg"
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/hero-video-v2.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.55) 100%)`,
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 50% 45%, transparent 25%, rgba(0,0,0,0.5) 100%)",
          }}
        />
      </motion.div>

      <motion.div style={{ y: contentY, opacity }} className="relative z-10">
        <Container className="pt-24 pb-20 md:pt-32 md:pb-28">
          <HeroStaggerRoot>
            <HeroStaggerChild>
              <HeroColumnStagger className="max-w-5xl">
                <HeroLineItem>
                  <motion.p
                    className="mb-6 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: "rgba(255,255,255,0.65)" }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                  >
                    Research collective
                  </motion.p>
                </HeroLineItem>

                <HeroLineItem>
                  <h1
                    className="font-sans font-semibold leading-[1.08] tracking-tight"
                    style={{
                      fontSize: "clamp(2.2rem, 5.5vw, 3.75rem)",
                      color: WHITE,
                    }}
                  >
                    The world&apos;s most important
                    <br />
                    technologies need
                    <br />
                    <Accent>researchers who build.</Accent>
                  </h1>
                </HeroLineItem>

                <HeroLineItem className="mt-10">
                  <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                    <motion.p
                      className="font-sans text-base leading-relaxed md:text-lg"
                      style={{ color: "rgba(255,255,255,0.85)" }}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      Caliga is a research collective covering crypto, fintech,
                      deep tech, and frontier AI.
                    </motion.p>
                    <motion.div
                      className="flex flex-col justify-center gap-4"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href="/#contact"
                          className="inline-flex items-center px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-all hover:opacity-80"
                          style={{ background: AMBER, color: "#0a0a0a" }}
                        >
                          Collaborate
                        </Link>
                        <Link
                          href="/writing"
                          className="inline-flex items-center border px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-white hover:bg-white/5"
                          style={{
                            borderColor: "rgba(255,255,255,0.35)",
                            color: WHITE,
                          }}
                        >
                          Our research
                        </Link>
                      </div>
                    </motion.div>
                  </div>
                </HeroLineItem>
              </HeroColumnStagger>
            </HeroStaggerChild>
          </HeroStaggerRoot>
        </Container>
      </motion.div>
    </section>
  );
}

// ── Feature Section wrapper ────────────────────────────────────────────────────────
function FeatureSection({
  fig,
  num,
  title,
  body,
  children,
  cta,
  ctaHref,
  visual,
  reverse = false,
  dark = false,
}: {
  fig: string;
  num: string;
  title: React.ReactNode;
  body: React.ReactNode;
  children?: React.ReactNode;
  cta?: string;
  ctaHref?: string;
  visual?: React.ReactNode;
  reverse?: boolean;
  dark?: boolean;
}) {
  const bg = dark ? DARK_SECTION : WHITE;
  const text = dark ? WHITE : INK;
  const muted = dark ? "rgba(255,255,255,0.6)" : MUTED_TEXT;
  const border = dark ? "rgba(255,255,255,0.1)" : RULE;

  return (
    <SectionReveal amount={0.06}>
      <section
        className="scroll-mt-24 border-b py-16 md:py-24"
        style={{ background: bg, borderColor: border }}
      >
        <Container>
          <FigLabel>{fig}</FigLabel>

          <div className={`mt-2 grid gap-12 lg:grid-cols-2 ${reverse ? "lg:grid-flow-dense" : ""}`}>
            {/* Text column */}
            <div className={reverse ? "lg:col-start-2" : ""}>
              <div className="flex items-start gap-4">
                <SectionNum>{num}</SectionNum>
                <div className="pt-3">
                  <h2
                    className="font-sans font-semibold leading-[1.12] tracking-tight"
                    style={{
                      fontSize: "clamp(1.7rem, 3.5vw, 2.75rem)",
                      color: text,
                    }}
                  >
                    {title}
                  </h2>
                </div>
              </div>

              <div
                className="mt-6 max-w-lg text-base leading-relaxed"
                style={{ color: muted }}
              >
                {body}
              </div>

              {children && <div className="mt-8">{children}</div>}

              {cta && ctaHref && (
                <div className="mt-8">
                  <MonoBtn variant={dark ? "secondary" : "primary"} href={ctaHref}>
                    {cta}
                  </MonoBtn>
                </div>
              )}
            </div>

            {/* Visual column */}
            {visual && (
              <div className={reverse ? "lg:col-start-1" : ""}>
                {visual}
              </div>
            )}
          </div>
        </Container>
      </section>
    </SectionReveal>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────────────
export default function Variation7Client() {
  return (
    <div className="text-[#111111]" style={{ background: WHITE }}>
      <ScrollProgressBar />
      <Header />
      <main>
        {/* VIDEO HERO */}
        <HeroEntrance>
          <VideoHeroSection />
        </HeroEntrance>

        {/* THESIS — FIG.1 */}
        <FeatureSection
          fig="FIG.1"
          num="01"
          title={
            <>
              Most of the value in frontier markets{" "}
              <Accent>is captured</Accent> before the thesis{" "}
              <Accent>becomes consensus.</Accent>
            </>
          }
          body={
            <>
              <p>
                Frontier technology moves faster than most research processes.
                The teams that reach good decisions do so because they
                understand how things work, not just that they are moving.
              </p>
              <p className="mt-4">
                We work with founders who expect reviewers to read the
                implementation, question the assumptions, and document the
                edge cases.
              </p>
            </>
          }
          cta="Why we exist"
          ctaHref="/#thesis"
          dark
          visual={
            <div
              className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <AuroraBackground
                animationSpeed={90}
                opacity={0.2}
                colors={["#111111", "#1f1f1f", "#2a2a2a", "#181818", "#0f0f0f"]}
              />
              <span className="relative font-mono text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>
                FIG.1 Visualization
              </span>
            </div>
          }
        />

        {/* METHOD — FIG.2 */}
        <FeatureSection
          fig="FIG.2"
          num="02"
          title={<>Research first.</>}
          body={
            <>
              <p>
                Our published work includes memos, models, and datasets that
                can be independently verified. When we allocate capital it is
                early, concentrated, and based on a documented thesis.
              </p>
            </>
          }
          cta="The method"
          ctaHref="/#method"
          visual={
            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  label: "Open methodology",
                  desc: "Sources cited. Steps documented. Findings reproducible.",
                  bg: (
                    <div className="pointer-events-none absolute inset-0" aria-hidden>
                      <OpenNetworkAnimation color="#111111" opacity={0.09} />
                    </div>
                  ),
                },
                {
                  label: "Adversarial review",
                  desc: "Hard questions are part of the deliverable, not a footnote.",
                  bg: (
                    <div className="pointer-events-none absolute inset-0" aria-hidden>
                      <TreeAnimation color="#111111" opacity={0.12} />
                    </div>
                  ),
                },
                {
                  label: "AI-assisted synthesis",
                  desc: "Structured tools for faster research without sacrificing rigor.",
                  bg: (
                    <div className="pointer-events-none absolute inset-0" aria-hidden>
                      <FlickeringGrid
                        className="absolute inset-0 h-full w-full"
                        color="#BC7C3C"
                        squareSize={3}
                        gridGap={7}
                        flickerChance={0.06}
                        maxOpacity={0.2}
                      />
                    </div>
                  ),
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="relative overflow-hidden border p-5"
                  style={{ borderColor: RULE, background: WHITE }}
                >
                  {card.bg}
                  <div className="relative">
                    <p className="font-sans text-sm font-semibold" style={{ color: INK }}>
                      {card.label}
                    </p>
                    <p className="mt-1 font-sans text-sm leading-relaxed" style={{ color: MUTED_TEXT }}>
                      {card.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { num: "2.1", label: "Open methodology", desc: "Sources cited. Steps documented. Findings reproducible." },
              { num: "2.2", label: "Adversarial review", desc: "Hard questions are part of the deliverable, not a footnote." },
              { num: "2.3", label: "AI-assisted synthesis", desc: "Structured tools for faster research without sacrificing rigor." },
            ].map((s) => (
              <div key={s.num} className="flex gap-3">
                <SubNum>{s.num}</SubNum>
                <div>
                  <p className="text-sm font-medium" style={{ color: INK }}>{s.label}</p>
                  <p className="mt-0.5 text-sm leading-relaxed" style={{ color: MUTED_TEXT }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </FeatureSection>

        {/* TEAM — FIG.3 */}
        <SectionReveal amount={0.07}>
          <section
            id="team"
            className="scroll-mt-24 border-b py-16 md:py-24"
            style={{ background: WHITE, borderColor: RULE }}
          >
            <Container>
              <FigLabel>FIG.3</FigLabel>

              <div className="mt-2 flex items-start gap-4">
                <SectionNum>03</SectionNum>
                <div className="pt-3">
                  <h2
                    className="font-sans font-semibold leading-[1.12] tracking-tight"
                    style={{
                      fontSize: "clamp(1.7rem, 3.5vw, 2.75rem)",
                      color: INK,
                    }}
                  >
                    Multiple members, one standard.
                  </h2>
                </div>
              </div>

              <p className="mt-5 max-w-2xl text-base leading-relaxed" style={{ color: MUTED_TEXT }}>
                We publish before we pitch.
              </p>

              <StaggerOnView className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                {team.map((member) => (
                  <StaggerItem key={member.handle} className="h-full">
                    <article className="relative flex h-full flex-col overflow-hidden border bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]" style={{ borderColor: RULE }}>
                      <div className="flex justify-center px-7 pt-7 md:justify-start">
                        <div className="relative aspect-[4/5] w-[min(100%,10rem)] shrink-0 overflow-hidden bg-[#f2f2f2] ring-1 ring-[#d8d8d8] sm:w-[10.5rem] md:w-[9.25rem] lg:w-[10rem]">
                          <Image
                            src={member.image}
                            alt={`${member.handle}, ${member.role}`}
                            fill
                            sizes="(max-width: 768px) 160px, 200px"
                            className="object-cover"
                          />
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col px-7 pb-7 pt-6">
                        <div className="h-px w-10 bg-[#111111]" />
                        <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em]" style={{ color: INK }}>
                          {member.handle}
                          <span className="mx-1.5 font-normal" style={{ color: AMBER }}>
                            ·
                          </span>
                          <span style={{ color: AMBER }}>{member.city}</span>
                        </p>
                        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em]" style={{ color: AMBER }}>
                          Founder
                        </p>
                        <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight" style={{ color: INK }}>
                          {member.role}
                        </h3>
                        <p className="mt-3 flex-1 font-sans text-sm leading-relaxed" style={{ color: INK }}>
                          {member.blurb}
                        </p>
                        <a
                          href={member.xUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] underline underline-offset-4 transition-opacity hover:opacity-80"
                          style={{ color: AMBER, textDecorationColor: AMBER }}
                        >
                          Profile on X ↗
                        </a>
                      </div>
                    </article>
                  </StaggerItem>
                ))}
              </StaggerOnView>
            </Container>
          </section>
        </SectionReveal>

        {/* CONTACT — FIG.4 */}
        <SectionReveal amount={0.07}>
          <section
            id="contact"
            className="scroll-mt-24 py-16 md:py-24"
            style={{ background: DARK_SECTION }}
          >
            <Container>
              <FigLabel>FIG.4</FigLabel>

              <div className="mt-2 grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <div className="flex items-start gap-4">
                    <SectionNum>04</SectionNum>
                    <div className="pt-3">
                      <h2
                        className="font-sans font-semibold leading-[1.12] tracking-tight"
                        style={{
                          fontSize: "clamp(1.7rem, 3.5vw, 2.75rem)",
                          color: WHITE,
                        }}
                      >
                        Let&apos;s work together.
                      </h2>
                    </div>
                  </div>

                  <p className="mt-5 max-w-lg text-base leading-relaxed" style={{ color: "rgba(255,255,255,0.75)" }}>
                    Share the problem, what you have built, and what you want
                    reviewed. We respond when the research can add real value.
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href={SOCIAL_X_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                      style={{ background: WHITE, color: INK }}
                    >
                      Message on X
                    </a>
                    <a
                      href="mailto:hello@efimov.xyz"
                      className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-white"
                      style={{ borderColor: "#2a2a2a", color: WHITE }}
                    >
                      Email us
                    </a>
                  </div>
                </div>

                <div
                  className="relative overflow-hidden border p-8 md:p-10"
                  style={{ borderColor: "#1e1e1e" }}
                >
                  <AtAGlanceFloatingPaths strokeColor="#BC7C3C" />
                  <div className="relative">
                    <p
                      className="font-mono text-[11px] font-medium uppercase tracking-[0.16em]"
                      style={{ color: AMBER }}
                    >
                      How we work
                    </p>
                    <p
                      className="mt-6 font-sans text-lg font-semibold leading-snug"
                      style={{ color: WHITE }}
                    >
                      Frontier markets reward teams that understand mechanism,
                      not just momentum.
                    </p>
                    <p
                      className="mt-4 font-sans text-base leading-relaxed"
                      style={{ color: "rgba(255,255,255,0.75)" }}
                    >
                      Our output is research you can trace, not a presentation.
                    </p>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>
      </main>
      <Footer />
    </div>
  );
}
