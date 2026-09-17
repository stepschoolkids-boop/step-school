"use client";

import { Icon } from "@/components/ui/Icon";
import { applyTheme, useTheme } from "@/lib/theme";

/**
 * One button, two icons stacked in place: the moon shows in dark mode, the sun in light mode,
 * and they rotate/scale into each other (CSS in globals.css, driven by <html data-theme>).
 * The visible icon is always right on first paint because the attribute is set before hydration;
 * only the accessible label waits for mount.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const theme = useTheme();
  const label = theme === "dark" ? "Switch to light mode" : "Switch to dark mode";
  return (
    <button
      type="button"
      onClick={() => applyTheme(theme === "dark" ? "light" : "dark")}
      aria-label={label}
      title={label}
      className={`theme-toggle relative grid size-11 place-items-center rounded-full border border-ink/15 bg-ink/5 text-ink transition-colors hover:bg-ink/10 ${className}`}
    >
      <Icon name="moon" className="icon-moon size-5" />
      <Icon name="sun" className="icon-sun size-5" />
    </button>
  );
}
