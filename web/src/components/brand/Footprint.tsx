import type { SVGProps } from "react";

/**
 * The STEP mark as a decorative motif — geometry aligned to the official
 * paw logo (four round toes over an oval pad). Used for trails, bullets and
 * background patterns; the logo itself is always the official image asset.
 */
export function Footprint({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false" className={className} {...props}>
      <ellipse cx="50" cy="66" rx="27" ry="21" />
      <circle cx="19" cy="41" r="10" />
      <circle cx="39" cy="26" r="11" />
      <circle cx="61" cy="26" r="11" />
      <circle cx="81" cy="41" r="10" />
    </svg>
  );
}
