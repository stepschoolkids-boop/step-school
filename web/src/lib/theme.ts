"use client";

import { useEffect, useState } from "react";

/**
 * Theme state lives on <html data-theme>. Dark is the default and needs no attribute;
 * light sets data-theme="light". The choice is saved in localStorage and restored by
 * THEME_INIT_SCRIPT before first paint. The OS preference is intentionally ignored.
 */
export type Theme = "dark" | "light";

export const THEME_KEY = "ssk-theme";
export const THEME_COLORS: Record<Theme, string> = { dark: "#050a17", light: "#f7f9ff" };

/** Inline <head> script: runs before hydration, so a saved light theme never flashes dark. */
export const THEME_INIT_SCRIPT = `(function(){try{if(localStorage.getItem(${JSON.stringify(THEME_KEY)})==="light"){document.documentElement.setAttribute("data-theme","light");var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute("content",${JSON.stringify(THEME_COLORS.light)});}}catch(e){}})();`;

export function readTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

let switchTimer: ReturnType<typeof setTimeout> | undefined;

/** Apply + persist a theme. Colours ease for ~450 ms via the `theme-switching` class (skipped under reduced motion). */
export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduced) {
    root.classList.add("theme-switching");
    clearTimeout(switchTimer);
    switchTimer = setTimeout(() => root.classList.remove("theme-switching"), 500);
  }
  if (theme === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode / storage blocked: the theme still applies for this visit */
  }
}

/** Current theme, kept in sync with <html data-theme>. Returns "dark" until mounted (matches SSR). */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const sync = () => setTheme(readTheme());
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}
