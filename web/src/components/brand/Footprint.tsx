import type { SVGProps } from "react";

/**
 * The STEP mark — a three-toed dinosaur footprint.
 * Used as logo mark, section bullets, journey path and background pattern.
 */
export function Footprint({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 120" aria-hidden="true" focusable="false" className={className} {...props}>
      <ellipse cx="50" cy="86" rx="30" ry="25" />
      <ellipse cx="50" cy="46" rx="13" ry="23" />
      <ellipse cx="22" cy="60" rx="12" ry="21" transform="rotate(-34 22 60)" />
      <ellipse cx="78" cy="60" rx="12" ry="21" transform="rotate(34 78 60)" />
      <path d="M50 20 L44 30 L56 30 Z" />
      <path d="M8 40 L9 52 L18 46 Z" />
      <path d="M92 40 L91 52 L82 46 Z" />
    </svg>
  );
}
