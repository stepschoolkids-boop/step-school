"use client";

import { useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";

export const EASE = [0.2, 0.8, 0.2, 1] as const;
export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Returns true when the user prefers reduced motion (SSR-safe: false on server). */
export function usePrefersReducedMotion(): boolean {
  return useReducedMotion() ?? false;
}

/** SSR-safe media query hook. Returns `initial` until mounted. */
export function useMediaQuery(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

/** True on devices with a fine pointer (mouse/trackpad) — cursor effects only there. */
export function useFinePointer(): boolean {
  return useMediaQuery("(pointer: fine)");
}
