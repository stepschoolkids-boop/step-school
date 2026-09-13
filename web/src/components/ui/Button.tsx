"use client";

import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { usePrefersReducedMotion } from "@/lib/motion";

type ButtonProps = {
  href?: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "lg";
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-display font-semibold tracking-tight whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60";
const sizes = {
  md: "h-12 px-6 text-[1rem]",
  lg: "h-14 px-8 text-[1.1rem]",
};
const variants = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  ghost: "text-ink hover:bg-ink/5",
};

/**
 * Magnetic button: leans toward the cursor on desktop (transform only, GPU cheap),
 * static on touch devices and under prefers-reduced-motion.
 */
export function Button({ href, children, variant = "primary", size = "md", className = "", type = "button", disabled, onClick, ariaLabel }: ButtonProps) {
  const ref = useRef<HTMLElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const onMove = (e: MouseEvent) => {
    if (reduced || !ref.current || window.matchMedia("(pointer: coarse)").matches) return;
    const r = ref.current.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.18;
    const y = (e.clientY - r.top - r.height / 2) * 0.28;
    ref.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;

  if (href) {
    return (
      <Link
        ref={ref as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={cls}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        aria-label={ariaLabel}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      ref={ref as React.RefObject<HTMLButtonElement>}
      type={type}
      disabled={disabled}
      className={cls}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
