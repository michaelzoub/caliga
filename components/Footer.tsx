"use client";

import Image from "next/image";
import Link from "next/link";

import { SectionReveal } from "@/components/hero/SectionReveal";
import { Container } from "@/components/ui";
import { SOCIAL_X_HANDLE_DISPLAY, SOCIAL_X_URL } from "@/lib/site";

const BRONZE = "#8A542E";

const columns = [
  {
    title: "Research —",
    links: [
      { label: "Writing", href: "/writing" },
      { label: "Thesis", href: "/#thesis" },
      { label: "Approach", href: "/#method" },
      { label: "Team", href: "/#team" },
    ],
  },
  {
    title: "Work with us —",
    links: [
      { label: "Contact", href: "/#contact" },
      { label: "Research & updates", href: SOCIAL_X_URL, external: true },
    ],
  },
  {
    title: "Legal —",
    links: [
      { label: "Privacy", href: "/legal#privacy" },
      { label: "Terms", href: "/legal#terms" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/12 bg-black text-white">
      <SectionReveal amount={0.1} delay={0.04} className="relative py-14 md:py-18">
        <Container className="max-w-[1400px]">
          <div className="grid gap-12 lg:grid-cols-[1fr_auto] lg:items-start lg:gap-16">
            <div className="min-w-0 overflow-hidden">
              <Image
                src="/CALIGAlogowhite.png"
                alt="Caliga"
                width={900}
                height={470}
                className="h-10 w-auto select-none md:h-12"
              />

              <div className="mt-8 max-w-xl space-y-3">
                <p className="font-sans text-sm leading-relaxed text-white/58">
                  Caliga publishes research and commentary for informational and educational
                  purposes only and does not provide investment advice, investment recommendations,
                  or an offer or solicitation to buy or sell any security or financial instrument.
                  Any investment activity is high risk; do your own diligence and consult qualified
                  advisors.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-wider" style={{ color: BRONZE }}>
                  © {new Date().getFullYear()} Caliga. All rights reserved.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-10 gap-y-10 md:gap-x-14">
              {columns.map((col) => (
                <div key={col.title}>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: BRONZE }}>
                    {col.title}
                  </p>
                  <nav className="mt-4 space-y-2" aria-label={col.title}>
                    {col.links.map((l) => {
                      const cls =
                        "block font-sans text-sm font-medium text-white/68 transition-colors hover:text-white";

                      if ("disabled" in l && l.disabled) {
                        return (
                          <span key={l.label} className="block font-sans text-sm" style={{ color: BRONZE }}>
                            {l.label}
                          </span>
                        );
                      }

                      if ("external" in l && l.external) {
                        return (
                          <a
                            key={l.label}
                            href={l.href}
                            className={cls}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {l.label}
                          </a>
                        );
                      }

                      return (
                        <Link key={l.label} href={l.href} className={cls}>
                          {l.label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              ))}

              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: BRONZE }}>
                  Contact —
                </p>
                <div className="mt-4 space-y-2">
                  <a
                    href="mailto:hello@caliga.xyz"
                    className="block font-sans text-sm font-medium text-white/68 underline underline-offset-4 transition-colors hover:text-white"
                    style={{ textDecorationColor: BRONZE }}
                  >
                    hello@caliga.xyz
                  </a>
                  <a
                    href={SOCIAL_X_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block font-sans text-sm font-medium text-white/68 underline underline-offset-4 transition-colors hover:text-white"
                    style={{ textDecorationColor: BRONZE }}
                  >
                    {SOCIAL_X_HANDLE_DISPLAY}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </SectionReveal>
    </footer>
  );
}
