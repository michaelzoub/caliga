"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

import { Button } from "@/components/ui";
import { SOCIAL_X_URL } from "@/lib/site";

export type MobileNavLink = {
  label: string;
  href: string;
};

type Props = {
  links: readonly MobileNavLink[];
};

/** Primary nav + CTAs for viewports below `md` only. Desktop layout is unchanged. */
export function MobileNav({ links }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const panel = (
    <AnimatePresence>
      {open ? (
        <div
          className="fixed inset-0 z-[200] md:hidden"
          key="mobile-nav-root"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-zinc-950/45"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <motion.div
            id="mobile-primary-nav"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-nav-title"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-3 right-3 top-20 z-[201] flex max-h-[min(78dvh,34rem)] flex-col overflow-hidden border border-black/14 bg-white sm:top-20"
          >
            <div className="flex items-center justify-between border-b border-black/12 bg-black/[0.035] px-4 py-3">
              <p
                id="mobile-nav-title"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-black/50"
              >
                Navigate
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-none border border-black/14 bg-white px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-black transition-colors hover:bg-black/[0.04]"
              >
                Close
              </button>
            </div>
            <nav
              className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain px-4 py-1"
              aria-label="Mobile primary"
            >
              {links.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="border-b border-black/10 py-4 font-sans text-[15px] font-semibold tracking-tight text-black transition-colors hover:text-[#8A542E] last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t border-black/12 bg-black/[0.035] px-4 py-4">
              <Button
                href={SOCIAL_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full justify-center !bg-black !px-4 !py-3 !text-[10px] !text-white font-mono uppercase tracking-[0.14em]"
                onClick={() => setOpen(false)}
              >
                Research &amp; updates
              </Button>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="relative z-[3] ml-auto md:hidden">
      <button
        type="button"
        id="mobile-nav-toggle"
        onClick={() => setOpen((v) => !v)}
        className="rounded-none border border-black/14 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-black transition-colors hover:bg-black/[0.04]"
        aria-expanded={open}
        aria-controls="mobile-primary-nav"
      >
        {open ? "Close" : "Menu"}
      </button>

      {panel}
    </div>
  );
}
