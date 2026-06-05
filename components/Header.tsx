import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "@/components/MobileNav";

const nav = [
  { label: "Thesis", href: "/#thesis" },
  { label: "Method", href: "/#method" },
  { label: "Team", href: "/#team" },
  { label: "Writing", href: "/writing" },
] as const;

const mobileNavLinks = nav.map(({ label, href }) => ({ label, href }));

export function Header() {
  return (
      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:px-8">
          <Link
            href="/"
            className="relative z-[2] flex h-full items-center outline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white/70"
            aria-label="Caliga home"
          >
            <Image
              src="/CALIGAlogo.png"
              alt="Caliga"
              width={900}
              height={470}
              priority
              className="h-8 w-auto select-none brightness-0 invert md:h-9"
            />
          </Link>
          <nav
            className="hidden items-center gap-1 min-[980px]:flex"
            aria-label="Primary"
          >
            {nav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex h-8 w-32 items-center bg-black/35 px-2 font-mono text-[11px] uppercase text-white/78 backdrop-blur-sm transition-colors hover:bg-black/55 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav links={mobileNavLinks} />
        </div>
      </header>
  );
}
