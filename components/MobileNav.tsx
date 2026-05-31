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
            className="absolute left-3 right-3 top-[7rem] z-[201] flex max-h-[min(78dvh,34rem)] flex-col overflow-hidden border border-zinc-200 bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.18)] sm:top-[7.25rem]"
          >
            <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-4 py-3">
              <p
                id="mobile-nav-title"
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[#BC7C3C]"
              >
                Navigate
              </p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-none border border-zinc-300 bg-white px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-[0.16em] text-[#111111] transition-colors hover:text-[#BC7C3C]"
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
                  className="border-b border-zinc-100 py-4 font-sans text-[15px] font-semibold tracking-tight text-[#111111] transition-colors hover:text-[#BC7C3C] last:border-b-0"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-2 border-t border-zinc-200 bg-zinc-50/80 px-4 py-4">
              <Button
                href={SOCIAL_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                variant="primary"
                className="w-full justify-center !px-4 !py-3 !text-[10px] font-mono uppercase tracking-[0.14em]"
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
        className="rounded-none border border-zinc-400 bg-white px-3 py-2 font-mono text-[10px] uppercase tracking-[0.16em] text-[#111111] shadow-sm transition-colors hover:text-[#BC7C3C]"
        aria-expanded={open}
        aria-controls="mobile-primary-nav"
      >
        {open ? "Close" : "Menu"}
      </button>

      {panel}
    </div>
  );
}
