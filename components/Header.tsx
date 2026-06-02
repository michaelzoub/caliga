import Link from "next/link";
import Image from "next/image";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { MobileNav } from "@/components/MobileNav";
import { Container } from "@/components/ui";

const nav = [
  { label: "Why we exist", href: "/#thesis" },
  { label: "Approach", href: "/#method" },
  { label: "Team", href: "/#team" },
  { label: "Writing", href: "/writing" },
] as const;

const mobileNavLinks = nav.map(({ label, href }) => ({ label, href }));

export function Header() {
  return (
    <>
      <AnnouncementBar />
      <header className="sticky top-0 z-50 border-b border-zinc-300/70 bg-zinc-100/95 backdrop-blur-md backdrop-saturate-150">
        <Container className="relative flex h-14 min-w-0 items-center gap-3 md:h-16 md:gap-4">
          <Link
            href="/"
            className="relative z-[2] flex h-full items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BC7C3C]"
            aria-label="Caliga home"
          >
            <Image
              src="/caliga-logo.png"
              alt="Caliga"
              width={900}
              height={470}
              priority
              className="h-8 w-auto select-none md:h-9"
            />
          </Link>
          <nav
            className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center gap-8 md:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[#111111] transition-colors hover:text-[#BC7C3C]"
              >
                {item.label}
                {"hasCaret" in item && item.hasCaret ? (
                  <span className="text-[9px] text-[#BC7C3C]" aria-hidden>
                    ▾
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>
          <MobileNav links={mobileNavLinks} />
        </Container>
      </header>
    </>
  );
}
