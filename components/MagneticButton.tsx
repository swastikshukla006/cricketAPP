"use client";

import { MouseEvent, ReactNode, useRef } from "react";

type MagneticButtonProps = {
  href: string;
  children: ReactNode;
  variant?: "dark" | "light";
  ariaLabel?: string;
};

export function MagneticButton({ href, children, variant = "dark", ariaLabel }: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);

  function handleMove(event: MouseEvent<HTMLAnchorElement>) {
    const element = ref.current;
    if (
      !element ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(hover: hover) and (pointer: fine)").matches
    ) return;
    const rect = element.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    element.style.transform = `translate(${x * 0.16}px, ${y * 0.24}px)`;
  }

  function handleLeave() {
    const element = ref.current;
    if (!element) return;
    element.style.transform = "translate(0, 0)";
  }

  const styles =
    variant === "dark"
      ? "bg-ink text-white hover:bg-accent"
      : "bg-white text-ink shadow-line hover:bg-ink hover:text-white";

  return (
    <a
      ref={ref}
      href={href}
      aria-label={ariaLabel}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`focus-ring inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-black uppercase tracking-[0.18em] transition-[transform,background-color,color,box-shadow] duration-300 ease-out ${styles}`}
    >
      {children}
    </a>
  );
}
