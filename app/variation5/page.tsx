import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { AuroraBackground } from "@/components/backgrounds/AuroraBackground";
import { AtAGlanceFloatingPaths } from "@/components/backgrounds/FloatingPaths";
import GameOfLife from "@/components/backgrounds/GameOfLife";
import OpenNetworkAnimation from "@/components/backgrounds/OpenNetworkAnimation";
import TreeAnimation from "@/components/backgrounds/TreeAnimation";
import PixelBlast from "@/components/backgrounds/PixelBlast";
import PixelHammer from "@/components/backgrounds/PixelHammer";
import PixelMountain from "@/components/backgrounds/PixelMountain";
import Threads from "@/components/backgrounds/Threads";
import { TopographyBackground } from "@/components/backgrounds/TopographyBackground";
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

// ── Palette ───────────────────────────────────────────────────────────────────
const HERO_BG = "#ffffff";
const WHITE = "#ffffff";
const INK = "#111111";
const DARK_SECTION = "#0e0e0e";
const RULE = "#d8d8d8";
const MUTED = "#111111";
const DIM = "#111111";
const AMBER = "#BC7C3C";

function Faded({ children }: { children: React.ReactNode }) {
  return <span style={{ color: DIM }}>{children}</span>;
}

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: AMBER }}>{children}</span>;
}

// ── Data ──────────────────────────────────────────────────────────────────────
const researchAreas = [
  {
    label: "Crypto & protocols",
    sub: "L1/L2 · DeFi · Custody",
    body: "Protocol economics, security assumptions, on-chain metrics, and the edge cases that standard diligence tends to miss.",
    bg: (
      <PixelBlast
        variant="square"
        pixelSize={2}
        color="#111111"
        patternScale={2}
        patternDensity={1}
        pixelSizeJitter={0}
        enableRipples
        rippleSpeed={0.38}
        rippleThickness={0.12}
        rippleIntensityScale={1.4}
        liquid={false}
        speed={0.48}
        edgeFade={0.28}
        transparent
      />
    ),
  },
  {
    label: "Fintech rails",
    sub: "Payments · Wallets · Settlement",
    body: "Cross-border infrastructure, wallet stacks, and regulatory surface area, reviewed at the implementation level.",
    bg: (
      <PixelBlast
        variant="square"
        pixelSize={2}
        color="#BC7C3C"
        patternScale={2}
        patternDensity={1}
        pixelSizeJitter={0}
        enableRipples
        rippleSpeed={0.35}
        rippleThickness={0.12}
        rippleIntensityScale={1.3}
        liquid={false}
        speed={0.44}
        edgeFade={0.3}
        transparent
      />
    ),
  },
  {
    label: "Frontier AI",
    sub: "Agents · Compute · Inference",
    body: "Agent pipelines, inference hardware, and emerging compute paradigms. We evaluate architecture, not just the demo.",
    bg: (
      <FlickeringGrid
        className="absolute inset-0 h-full w-full"
        color="#BC7C3C"
        squareSize={3}
        gridGap={7}
        flickerChance={0.05}
        maxOpacity={0.18}
      />
    ),
  },
  {
    label: "Robotics & deep tech",
    sub: "Hardware-software · Sensors",
    body: "Embedded systems, physical-digital interfaces, and hardware layers adjacent to financial infrastructure.",
    bg: (
      <Threads
        color={[0.77, 0.6, 0.38]}
        amplitude={0.8}
        distance={0}
        enableMouseInteraction
      />
    ),
  },
];

const team = [
  {
    handle: "Feuter",
    image: "/feuter.jpg",
    role: "Analytics & company research",
    city: "Singapore",
    xUrl: "https://x.com/feuters",
    blurb:
      "Graduate training with VC exposure, specializing in analytics, financial modeling, and company analysis. Former operator with direct experience building and running a business.",
    Bg: PixelMountain,
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background with hands-on engineering experience across multiple startup stacks. Evaluates architecture, crafts automations and reviews implementation directly.",
    Bg: PixelHammer,
  },
];

export const metadata: Metadata = {
  title: "Caliga — Research on frontier technology",
  description:
    "A two-person research collective covering crypto, fintech, deep tech, and frontier AI.",
  robots: { index: false, follow: true },
};

export default function Variation5Page() {
  return (
    <div style={{ background: HERO_BG }} className="text-[#111111]">
      <Header />
      <main>
        {/* HERO */}
        <HeroEntrance>
          <section className="relative flex min-h-[calc(100svh-6.5rem)] flex-col justify-center overflow-hidden py-16 md:min-h-[calc(100svh-7rem)] md:py-24">
            <TopographyBackground
              lineCount={20}
              lineColor="rgba(180, 140, 60, 0.18)"
              backgroundColor={HERO_BG}
              speed={0.8}
              strokeWidth={0.6}
            />

            <Container className="relative z-[1]">
              <HeroStaggerRoot>
                <HeroStaggerChild>
                  <HeroColumnStagger className="max-w-4xl">
                    <HeroLineItem>
                      <span />
                    </HeroLineItem>

                    <HeroLineItem>
                      <h1
                        className="font-sans font-semibold leading-[1.08] tracking-tight"
                        style={{
                          fontSize: "clamp(2rem, 5.5vw, 3.75rem)",
                          color: INK,
                        }}
                      >
                        <Faded>Research on</Faded> frontier technology
                        <br />
                        <Faded>before the market</Faded>
                        <br />
                        <Accent>prices it in.</Accent>
                      </h1>
                    </HeroLineItem>

                    <HeroLineItem className="mt-8">
                      <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
                        <p
                          className="font-serif-display text-base leading-relaxed md:text-lg"
                          style={{ color: INK }}
                        >
                          Caliga is a research collective covering crypto,
                          fintech, deep tech, and frontier AI.
                        </p>
                        <div className="flex flex-col justify-center gap-4">
                          <div className="flex flex-wrap gap-3">
                            <Link
                              href="/#contact"
                              className="inline-flex items-center px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-opacity hover:opacity-80"
                              style={{ background: INK, color: WHITE }}
                            >
                              Collaborate
                            </Link>
                            <Link
                              href="/writing"
                              className="inline-flex items-center border px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.18em] font-medium transition-colors hover:border-[#111]"
                              style={{ borderColor: RULE, color: INK }}
                            >
                              Our research
                            </Link>
                          </div>
                        </div>
                      </div>
                    </HeroLineItem>
                  </HeroColumnStagger>
                </HeroStaggerChild>
              </HeroStaggerRoot>
            </Container>
          </section>
        </HeroEntrance>

        {/* THESIS */}
        <SectionReveal amount={0.06}>
          <section
            id="thesis"
            className="relative scroll-mt-24 overflow-hidden py-20 md:py-32"
            style={{ background: DARK_SECTION }}
          >
            <AuroraBackground
              animationSpeed={90}
              opacity={0.13}
              colors={["#111111", "#1f1f1f", "#2a2a2a", "#181818", "#0f0f0f"]}
            />
            <Container>
              <p
                className="mb-8 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                style={{ color: AMBER }}
              >
                Why we exist
              </p>

              <h2
                className="max-w-4xl font-sans font-semibold leading-[1.12] tracking-tight"
                style={{
                  fontSize: "clamp(1.9rem, 4.5vw, 3.75rem)",
                  color: WHITE,
                }}
              >
                Most of the value in frontier markets
                <br />
                <span style={{ color: AMBER }}>is captured</span> before the
                thesis
                <br />
                <span style={{ color: AMBER }}>becomes consensus.</span>
              </h2>

              <div className="mt-12 grid gap-8 lg:grid-cols-2">
                <p
                  className="font-serif-display text-lg leading-relaxed"
                  style={{ color: WHITE }}
                >
                  Frontier technology moves faster than most research processes.
                  The teams that reach good decisions do so because they
                  understand how things work, not just that they are moving.
                </p>
                <p
                  className="font-serif-display text-base leading-relaxed"
                  style={{ color: WHITE }}
                >
                  We work with founders who expect reviewers to read the
                  implementation, question the assumptions, and document the
                  edge cases.
                </p>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* RESEARCH AREAS (hidden) */}
        {(false as boolean) && (
          <SectionReveal amount={0.07}>
            <section
              id="research"
              className="scroll-mt-24 border-b border-t py-16 md:py-24"
              style={{ background: WHITE, borderColor: RULE }}
            >
              <Container>
                <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
                  <div className="lg:col-span-4">
                    <p
                      className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                      style={{ color: MUTED }}
                    >
                      Research areas
                    </p>
                    <h2
                      className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                      style={{ color: INK }}
                    >
                      Four domains. One standard.
                    </h2>
                    <p
                      className="mt-5 font-serif-display text-base leading-relaxed"
                      style={{ color: INK }}
                    >
                      Within each: primary research, documented methodology, and
                      explicit assumptions. We decline work that doesn&apos;t
                      meet that bar.
                    </p>
                  </div>

                  <div className="lg:col-span-8">
                    <StaggerOnView className="grid gap-6 sm:grid-cols-2">
                      {researchAreas.map((area, i) => (
                        <StaggerItem key={area.label}>
                          <div
                            className="relative overflow-hidden border p-6"
                            style={{ borderColor: RULE, background: WHITE }}
                          >
                            <div
                              className="pointer-events-none absolute inset-0"
                              aria-hidden
                            >
                              {area.bg}
                            </div>
                            <div className="relative">
                              <p
                                className="font-mono text-[10px] font-medium uppercase tracking-[0.16em]"
                                style={{ color: MUTED }}
                              >
                                {area.sub}
                              </p>
                              <h3
                                className="mt-3 font-sans text-lg font-semibold tracking-tight"
                                style={{ color: INK }}
                              >
                                {area.label}
                              </h3>
                              <p
                                className="mt-2 font-serif-display text-sm leading-relaxed"
                                style={{ color: INK }}
                              >
                                {area.body}
                              </p>
                              <div
                                className="mt-5 h-px w-12"
                                style={{
                                  background: i % 2 === 0 ? AMBER : INK,
                                }}
                              />
                            </div>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerOnView>
                  </div>
                </div>
              </Container>
            </section>
          </SectionReveal>
        )}

        {/* THE METHOD */}
        <SectionReveal amount={0.06}>
          <section
            id="method"
            className="relative scroll-mt-24 overflow-hidden border-b py-16 md:py-24"
            style={{ background: WHITE, borderColor: RULE }}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <GameOfLife
                cellSize={4}
                color="#111111"
                speed={650}
                opacity={0.028}
                density={0.14}
              />
            </div>
            <Container>
              <div className="mx-auto max-w-4xl">
                <p
                  className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-center"
                  style={{ color: MUTED }}
                >
                  The method
                </p>
                <h2
                  className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl text-center"
                  style={{ color: INK }}
                >
                  Research first.
                </h2>
                <p
                  className="mx-auto mt-6 max-w-2xl font-serif-display text-base leading-relaxed text-center md:text-lg"
                  style={{ color: INK }}
                >
                  Our published work includes memos, models, and datasets that
                  can be independently verified. When we allocate capital it is
                  early, concentrated, and based on a documented thesis.
                </p>

                <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div
                    className="relative overflow-hidden border p-6"
                    style={{ borderColor: RULE, background: WHITE }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden
                    >
                      <OpenNetworkAnimation color="#111111" opacity={0.09} />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        Open methodology
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        Sources cited. Steps documented. Findings reproducible.
                      </p>
                    </div>
                  </div>

                  <div
                    className="relative overflow-hidden border p-6"
                    style={{ borderColor: RULE, background: WHITE }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden
                    >
                      <TreeAnimation color="#111111" opacity={0.12} />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        Adversarial review
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        Hard questions are part of the deliverable, not a
                        footnote.
                      </p>
                    </div>
                  </div>

                  <div
                    className="relative overflow-hidden border p-6"
                    style={{ borderColor: RULE, background: WHITE }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0"
                      aria-hidden
                    >
                      <FlickeringGrid
                        className="absolute inset-0 h-full w-full"
                        color="#BC7C3C"
                        squareSize={3}
                        gridGap={7}
                        flickerChance={0.06}
                        maxOpacity={0.2}
                      />
                    </div>
                    <div className="relative">
                      <p
                        className="font-sans font-semibold text-sm"
                        style={{ color: INK }}
                      >
                        AI-assisted synthesis
                      </p>
                      <p
                        className="mt-2 font-serif-display text-sm leading-relaxed"
                        style={{ color: MUTED }}
                      >
                        Structured tools for faster research without sacrificing
                        rigor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Container>
          </section>
        </SectionReveal>

        {/* TEAM */}
        <SectionReveal amount={0.07}>
          <section
            id="team"
            className="scroll-mt-24 border-b py-16 md:py-24"
            style={{ background: WHITE, borderColor: RULE }}
          >
            <Container>
              <p
                className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                style={{ color: MUTED }}
              >
                Team
              </p>
              <h2
                className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                style={{ color: INK }}
              >
                Multiple members, one standard.
              </h2>
              <p
                className="mt-3 max-w-2xl font-serif-display text-sm leading-relaxed md:text-base"
                style={{ color: MUTED }}
              >
                We publish before we pitch.
              </p>

              <StaggerOnView className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10 lg:gap-12">
                {team.map((member) => {
                  const { Bg } = member;
                  return (
                    <StaggerItem key={member.handle} className="h-full">
                      <article className="relative flex h-full flex-col overflow-hidden border border-[#d8d8d8] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
                        <div
                          className="pointer-events-none absolute inset-0 opacity-70"
                          aria-hidden
                        >
                          <Bg accentRgb={[201, 168, 124]} />
                        </div>

                        <div className="relative flex justify-center px-7 pt-7 md:justify-start">
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

                        <div className="relative flex flex-1 flex-col px-7 pb-7 pt-6">
                          <div className="h-px w-10 bg-[#111111]" />
                          <p className="mt-4 font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-[#111111]">
                            {member.handle}
                            <span className="mx-1.5 font-normal text-[#BC7C3C]">
                              ·
                            </span>
                            <span className="text-[#BC7C3C]">{member.city}</span>
                          </p>
                          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.18em] text-[#BC7C3C]">
                            Founder
                          </p>
                          <h3 className="mt-3 font-sans text-lg font-semibold tracking-tight text-[#111111]">
                            {member.role}
                          </h3>
                          <p className="mt-3 flex-1 font-serif-display text-sm leading-relaxed text-[#111111]">
                            {member.blurb}
                          </p>
                          <a
                            href={member.xUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-6 inline-flex w-fit font-mono text-[10px] uppercase tracking-[0.16em] text-[#BC7C3C] underline decoration-[#BC7C3C] underline-offset-4 transition-opacity hover:opacity-80"
                          >
                            Profile on X ↗
                          </a>
                        </div>
                      </article>
                    </StaggerItem>
                  );
                })}
              </StaggerOnView>
            </Container>
          </section>
        </SectionReveal>

        {/* CONTACT */}
        <SectionReveal amount={0.07}>
          <section
            id="contact"
            className="scroll-mt-24 py-20 md:py-28"
            style={{ background: DARK_SECTION }}
          >
            <Container>
              <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
                <div>
                  <p
                    className="mb-4 font-mono text-[10px] font-medium uppercase tracking-[0.22em]"
                    style={{ color: AMBER }}
                  >
                    Contact
                  </p>
                  <h2
                    className="font-sans font-semibold leading-tight tracking-tight text-3xl md:text-4xl"
                    style={{ color: WHITE }}
                  >
                    Let&apos;s work together.
                  </h2>
                  <p
                    className="mt-5 font-serif-display text-base leading-relaxed md:text-lg"
                    style={{ color: WHITE }}
                  >
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
                      className="mt-6 font-sans text-xl font-semibold leading-snug"
                      style={{ color: WHITE }}
                    >
                      Frontier markets reward teams that understand mechanism,
                      not just momentum.
                    </p>
                    <p
                      className="mt-4 font-serif-display text-base leading-relaxed"
                      style={{ color: WHITE }}
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
