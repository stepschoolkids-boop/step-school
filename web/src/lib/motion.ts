"use client";

import { useReducedMotion } from "motion/react";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Standard entrance variants used across sections. */
export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

export const stagger = (delayChildren = 0.08, staggerChildren = 0.1) => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
});

/** Returns true when the user prefers reduced motion (SSR-safe: false on server). */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}
