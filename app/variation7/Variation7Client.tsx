"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion, useScroll, useTransform } from "motion/react";

import { FlickeringGrid } from "@/components/effects/FlickeringGrid";
import OpenNetworkAnimation from "@/components/backgrounds/OpenNetworkAnimation";
import TreeAnimation from "@/components/backgrounds/TreeAnimation";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SectionReveal } from "@/components/hero/SectionReveal";
import { Container } from "@/components/ui";
import { SOCIAL_X_URL } from "@/lib/site";

const BG = "#ffffff";
const RULE = "#d7d7d7";
const BRONZE = "#8A542E";

const focusAreas = [
  "Protocol audits",
  "Payments research",
  "Technical diligence",
  "AI workflows",
  "Robotics analysis",
  "Investment memos",
  "Financial models",
  "Market datasets",
  "Product teardown",
  "Implementation review",
] as const;

const methodItems = [
  {
    label: "Open methodology",
    desc: "Sources cited. Steps documented. Findings reproducible.",
  },
  {
    label: "Adversarial review",
    desc: "Hard questions are part of the deliverable, not a footnote.",
  },
  {
    label: "AI-assisted synthesis",
    desc: "Structured tools for faster research without sacrificing rigor.",
  },
] as const;

const team = [
  {
    handle: "Feuter",
    image: "/feuter.jpg",
    role: "Analytics & company research",
    city: "Singapore",
    xUrl: "https://x.com/feuters",
    blurb:
      "Graduate training with VC exposure, specializing in analytics, financial modeling, and company analysis. Former operator with direct experience building and running a business.",
    gridColor: "#111111",
  },
  {
    handle: "Kafka",
    image: "/kafka.jpg",
    role: "Technical research",
    city: "NYC",
    xUrl: "https://x.com/wenkafka",
    blurb:
      "Computer science background with hands-on engineering experience across multiple startup stacks. Evaluates architecture, crafts automations and reviews implementation directly.",
    gridColor: BRONZE,
  },
] as const;

function Accent({ children }: { children: React.ReactNode }) {
  return <span style={{ color: BRONZE }}>{children}</span>;
}

function ArrowButton({
  children,
  href,
  variant = "dark",
}: {
  children: React.ReactNode;
  href: string;
  variant?: "dark" | "light" | "outline";
}) {
  const styles = {
    dark: "bg-black text-white hover:bg-zinc-800",
    light: "bg-white text-black hover:bg-zinc-200",
    outline:
      "border border-black/14 bg-white text-black/66 hover:border-black hover:text-black",
  }[variant];

  return (
    <Link
      href={href}
      className={`group inline-flex min-h-8 items-center justify-center gap-1 px-2.5 py-2 font-mono text-[11px] uppercase leading-none transition-colors ${styles}`}
    >
      {children}
      <span className="relative size-3 overflow-hidden" aria-hidden>
        <span className="absolute inset-0 flex -translate-x-full transition-transform duration-200 group-hover:translate-x-0">
          <ArrowUpRight className="size-3 shrink-0" strokeWidth={1.5} />
          <ArrowUpRight className="size-3 shrink-0" strokeWidth={1.5} />
        </span>
      </span>
    </Link>
  );
}

function VideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], [0, 46]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.playsInline = true;

    const play = () => {
      video.play().catch(() => {});
    };

    play();
    document.addEventListener("pointerdown", play, { once: true });
    return () => document.removeEventListener("pointerdown", play);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative -mx-5 flex min-h-[620px] flex-col justify-end overflow-hidden border-b md:-mx-8 lg:min-h-[690px]"
      style={{ background: "#0b0b0b", borderColor: RULE }}
    >
      <motion.div className="absolute inset-0" style={{ y: videoY }}>
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
          Your browser does not support the video tag.
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.42)_38%,rgba(0,0,0,0.16)_72%),linear-gradient(180deg,rgba(0,0,0,0.20)_0%,rgba(0,0,0,0.18)_52%,rgba(0,0,0,0.70)_100%)]" />
      </motion.div>

      <div className="relative z-10 grid gap-8 px-5 pb-8 md:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)] lg:items-end lg:pb-10">
        <div>
          <p className="mb-5 font-mono text-[10px] uppercase leading-none text-white/54 md:text-[11px]">
            Research collective
          </p>
          <h1 className="max-w-[650px] text-[clamp(2.2rem,4.1vw,4.2rem)] font-normal leading-[1.04] text-white">
            The world&apos;s most important technologies need{" "}
            <Accent>researchers who build.</Accent>
          </h1>
          <p className="mt-5 max-w-[430px] text-base leading-relaxed text-white/58">
            Caliga is a research collective covering crypto, fintech, deep
            tech, and frontier AI.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-1">
            <ArrowButton href="/#contact" variant="light">
              Collaborate
            </ArrowButton>
            <ArrowButton href="/writing" variant="outline">
              Our research
            </ArrowButton>
          </div>
        </div>

        <div className="hidden lg:block" />
      </div>
    </section>
  );
}

function FocusGrid() {
  return (
    <section className="border-y" style={{ borderColor: RULE }}>
      <div className="grid w-full grid-cols-2 md:grid-cols-5">
        {focusAreas.map((area, index) => (
          <div
            key={area}
            className="flex h-16 min-w-0 items-center justify-center p-3 text-center font-mono text-[10px] uppercase leading-tight text-black/48 md:h-20"
            style={{
              borderLeft: index % 5 === 0 ? "0" : "1px solid rgba(0,0,0,0.12)",
              borderTop: index < 5 ? "0" : "1px solid rgba(0,0,0,0.12)",
            }}
          >
            {area}
          </div>
        ))}
      </div>
    </section>
  );
}

function SectionShell({
  id,
  title,
  body,
  children,
  reverse = false,
}: {
  id: string;
  title: React.ReactNode;
  body: React.ReactNode;
  children: React.ReactNode;
  reverse?: boolean;
}) {
  return (
    <SectionReveal amount={0.08}>
      <section
        id={id}
        className="scroll-mt-20 border-b py-14 md:py-20"
        style={{ background: BG, borderColor: RULE }}
      >
        <Container className="max-w-[1400px]">
          <div
            className={`grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 ${
              reverse ? "lg:grid-flow-dense" : ""
            }`}
          >
            <div className={reverse ? "lg:col-start-2" : ""}>
              <h2 className="max-w-[620px] text-[clamp(2rem,3.4vw,3.6rem)] font-medium leading-[1.02] text-black">
                {title}
              </h2>
              <div className="mt-6 max-w-[540px] space-y-4 text-base leading-relaxed text-[#666666]">
                {body}
              </div>
            </div>
            <div className={reverse ? "lg:col-start-1" : ""}>{children}</div>
          </div>
        </Container>
      </section>
    </SectionReveal>
  );
}

function ResearchPanel() {
  return (
    <div className="relative grid min-h-[410px] grid-rows-[auto_1fr] overflow-hidden bg-[#f7f7f5]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <OpenNetworkAnimation color="#111111" opacity={0.12} />
      </div>
      <div className="relative grid grid-cols-3 bg-white/70">
        {["Mechanism", "Evidence", "Timing"].map((item) => (
          <div
            key={item}
            className="px-4 py-3 font-mono text-[10px] uppercase text-black/42"
          >
            {item}
          </div>
        ))}
      </div>
      <div className="relative grid place-items-center p-8">
        <div className="grid w-full max-w-[500px] gap-1.5 bg-white/70 p-1.5">
          {[
            ["Implementation read", "Question the assumptions"],
            ["Source trail", "Document the edge cases"],
            ["Market map", "Decide before consensus"],
          ].map(([left, right]) => (
            <div
              key={left}
              className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 bg-white/74 px-4 py-5"
            >
              <p className="text-sm text-black/72">{left}</p>
              <span className="size-1.5 bg-black" aria-hidden />
              <p className="text-right text-sm text-black/44">{right}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MethodPanel() {
  return (
    <div className="relative overflow-hidden bg-[#f7f7f5]">
      <div className="pointer-events-none absolute inset-0 opacity-80" aria-hidden>
        <TreeAnimation color="#111111" opacity={0.08} />
      </div>
      <div className="relative grid gap-1.5 bg-white/70 p-1.5">
        {methodItems.map((item) => (
          <div key={item.label} className="bg-white/74 p-6 md:p-7">
            <p className="text-xl font-medium leading-tight text-black">
              {item.label}
            </p>
            <p className="mt-3 max-w-[520px] text-sm leading-relaxed text-black/58 md:text-base">
              {item.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamSection() {
  return (
    <SectionReveal amount={0.08}>
      <section
        id="team"
        className="scroll-mt-20 border-b py-14 md:py-20"
        style={{ background: BG, borderColor: RULE }}
      >
        <Container className="max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div>
              <h2 className="max-w-[520px] text-[clamp(2rem,3.4vw,3.6rem)] font-medium leading-[1.02] text-black">
                Multiple members, one standard.
              </h2>
              <p className="mt-6 max-w-[440px] text-base leading-relaxed text-[#666666]">
                We publish before we pitch.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {team.map((member) => {
                return (
                  <article
                    key={member.handle}
                    className="grid overflow-hidden border bg-white"
                    style={{ borderColor: RULE }}
                  >
                    <div
                      className="relative aspect-[16/11] overflow-hidden border-b bg-[#f4f4f2]"
                      style={{ borderColor: RULE }}
                    >
                      <FlickeringGrid
                        className="absolute inset-0 h-full w-full"
                        color={member.gridColor}
                        squareSize={3}
                        gridGap={8}
                        flickerChance={0.035}
                        maxOpacity={0.16}
                      />
                      <div className="absolute inset-6 overflow-hidden bg-white md:inset-7">
                        <Image
                          src={member.image}
                          alt={`${member.handle}, ${member.role}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 420px"
                          className="object-cover object-center"
                        />
                      </div>
                    </div>
                    <div className="p-6 md:p-7">
                      <p className="font-mono text-[10px] uppercase text-black/42">
                        {member.handle}
                        <span className="mx-2" style={{ color: BRONZE }}>
                          /
                        </span>
                        {member.city}
                      </p>
                      <p
                        className="mt-1 font-mono text-[10px] uppercase"
                        style={{ color: BRONZE }}
                      >
                        Founder
                      </p>
                      <h3 className="mt-6 text-2xl font-medium leading-tight text-black">
                        {member.role}
                      </h3>
                      <p className="mt-4 text-base leading-relaxed text-black/58">
                        {member.blurb}
                      </p>
                      <a
                        href={member.xUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-7 inline-flex items-center gap-1 font-mono text-[10px] uppercase transition-colors hover:text-black"
                        style={{ color: BRONZE }}
                      >
                        Profile on X
                        <ArrowUpRight className="size-3" strokeWidth={1.5} />
                      </a>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>
    </SectionReveal>
  );
}

function ContactSection() {
  return (
    <SectionReveal amount={0.08}>
      <section
        id="contact"
        className="scroll-mt-20 py-14 md:py-20"
        style={{ background: BG }}
      >
        <Container className="max-w-[1400px]">
          <div className="grid gap-10 lg:grid-cols-[0.88fr_1.12fr] lg:gap-16">
            <div>
              <h2 className="max-w-[520px] text-[clamp(2rem,3.4vw,3.6rem)] font-medium leading-[1.02] text-black">
                Let&apos;s work together.
              </h2>
              <p className="mt-6 max-w-[500px] text-base leading-relaxed text-[#666666]">
                Share the problem, what you have built, and what you want
                reviewed. We respond when the research can add real value.
              </p>
              <div className="mt-9 flex flex-wrap gap-1">
                <ArrowButton href={SOCIAL_X_URL}>Message on X</ArrowButton>
                <ArrowButton href="mailto:hello@efimov.xyz" variant="outline">
                  Email us
                </ArrowButton>
              </div>
            </div>

            <div
              className="relative grid min-h-[320px] overflow-hidden bg-[#f7f7f5]"
            >
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <FlickeringGrid
                  className="h-full w-full"
                  color="#8A542E"
                  squareSize={3}
                  gridGap={12}
                  flickerChance={0.06}
                  maxOpacity={0.18}
                />
              </div>
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <OpenNetworkAnimation color="#111111" opacity={0.08} />
              </div>
              <div className="relative flex flex-col justify-end bg-white/72 p-6 md:p-8">
                <p className="max-w-[560px] text-2xl font-medium leading-tight text-black md:text-4xl">
                  Frontier markets reward teams that understand mechanism, not
                  just momentum.
                </p>
                <p className="mt-5 max-w-[460px] text-base leading-relaxed text-black/58">
                  Our output is research you can trace, not a presentation.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </SectionReveal>
  );
}

export default function Variation7Client() {
  return (
    <div className="min-h-screen text-black" style={{ background: BG }}>
      <Header />
      <main>
        <Container className="max-w-[1400px]">
          <VideoHero />
        </Container>
        <FocusGrid />

        <SectionShell
          id="thesis"
          title={
            <>
              Most of the value in frontier markets <Accent>is captured</Accent>{" "}
              before the thesis <Accent>becomes consensus.</Accent>
            </>
          }
          body={
            <>
              <p>
                Frontier technology moves faster than most research processes.
                The teams that reach good decisions do so because they
                understand how things work, not just that they are moving.
              </p>
              <p>
                We work with founders who expect reviewers to read the
                implementation, question the assumptions, and document the edge
                cases.
              </p>
            </>
          }
        >
          <ResearchPanel />
        </SectionShell>

        <SectionShell
          id="method"
          title="Research first."
          body={
            <p>
              Our published work includes memos, models, and datasets that can
              be independently verified. When we allocate capital it is early,
              concentrated, and based on a documented thesis.
            </p>
          }
          reverse
        >
          <MethodPanel />
        </SectionShell>

        <TeamSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}
