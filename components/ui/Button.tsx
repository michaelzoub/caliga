import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Common = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost" | "discover";
};

type ButtonProps = Common &
  (
    | ({ href?: undefined } & ButtonHTMLAttributes<HTMLButtonElement>)
    | ({ href: string } & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">)
  );

const base =
  "inline-flex items-center justify-center gap-2 rounded-none px-5 py-3 text-xs font-medium tracking-wide transition-[opacity,background-color,border-color,color] duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cyan)] disabled:pointer-events-none disabled:opacity-50";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "bg-[#111111] text-white active:opacity-95",
  secondary:
    "border border-zinc-300 bg-white text-[#111111] hover:border-[#BC7C3C]",
  ghost:
    "text-[#111111] hover:text-[#BC7C3C] border border-transparent hover:border-zinc-200",
  discover:
    "text-[#BC7C3C] hover:text-[#111111] gap-2 !px-2 !py-2 border-0 bg-transparent",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  href,
  ...rest
}: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`.trim();

  if (href) {
    return (
      <a href={href} className={cls} {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={cls} {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
