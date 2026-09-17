import type { SVGProps } from "react";

/** Small, consistent line-icon set (24px grid, 2px stroke). No icon library needed. */
const PATHS: Record<string, React.ReactNode> = {
  books: (
    <>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H9v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M9 4h4.5A1.5 1.5 0 0 1 15 5.5V20H9z" />
      <path d="m15 6.2 3.2-.9a1.5 1.5 0 0 1 1.9 1.1l2.7 10.2a1.5 1.5 0 0 1-1.1 1.8l-3.2.9" />
    </>
  ),
  uz: (
    <>
      <path d="M4 6h9M8.5 6v12M4 18h9" />
      <path d="M14 20l3.5-9L21 20M15.2 17h4.6" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m10 8.5 5 3.5-5 3.5z" />
    </>
  ),
  age: (
    <>
      <circle cx="12" cy="7" r="3.5" />
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0" />
      <path d="M17 4.5l1.2 1.2M17 8.5l1.2-1.2" />
    </>
  ),
  dialog: (
    <>
      <path d="M4 5h9a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9l-3 3v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" />
      <path d="M17 9h3a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1v3l-3-3h-3" />
    </>
  ),
  mistake: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12.5 2.5 2.5 5-5.5" />
    </>
  ),
  story: (
    <>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z" />
      <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20" />
      <path d="M9 8h7M9 11h5" />
    </>
  ),
  words: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M7 9h10M7 12.5h6M7 16h8" />
    </>
  ),
  game: (
    <>
      <rect x="2.5" y="7" width="19" height="10" rx="5" />
      <path d="M7.5 10.5v3M6 12h3M15.5 11h.01M17.5 13h.01" />
    </>
  ),
  colour: (
    <>
      <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-1 1.5-2s-.5-2 1-2H16a5 5 0 0 0 5-5c0-5-4-9-9-9z" />
      <circle cx="7.5" cy="11" r="1.2" /><circle cx="10.5" cy="7.5" r="1.2" /><circle cx="15" cy="8" r="1.2" />
    </>
  ),
  puzzle: (
    <>
      <path d="M10 3h4v2.5a1.5 1.5 0 0 0 3 0V3h4v4h-2.5a1.5 1.5 0 0 0 0 3H21v4h-4v-2.5a1.5 1.5 0 0 0-3 0V14h-4v2.5a1.5 1.5 0 0 1-3 0V14H3v-4h2.5a1.5 1.5 0 0 0 0-3H3V3h4v2.5a1.5 1.5 0 0 0 3 0z" />
    </>
  ),
  scene: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2.5" />
      <path d="m3 16 5-5 4 4 3-3 6 6" />
      <circle cx="16" cy="9" r="1.5" />
    </>
  ),
  box: (
    <>
      <path d="M3 8l9-4 9 4-9 4z" />
      <path d="M3 8v8l9 4 9-4V8M12 12v8" />
    </>
  ),
  parent: (
    <>
      <circle cx="9" cy="7" r="3" /><circle cx="17" cy="9" r="2.2" />
      <path d="M3 20a6 6 0 0 1 12 0M14.5 20a4 4 0 0 1 6.5-3" />
    </>
  ),
  riko: (
    <>
      <path d="M5 16c0-4 3-7 7-7 3 0 5 1.5 6.5 3.5L21 13l-2 2-1.5-.5" />
      <path d="M5 16v3h3l1-2h3l1 2h3" /><circle cx="15" cy="12" r=".6" fill="currentColor" />
      <path d="M8 9l1.5-3 1.5 2 1.5-2 1 2" />
    </>
  ),
  wave: <path d="M3 12c2-3 4-3 6 0s4 3 6 0 4-3 6 0M3 17c2-3 4-3 6 0s4 3 6 0 4-3 6 0M3 7c2-3 4-3 6 0s4 3 6 0 4-3 6 0" />,
  speak: (
    <>
      <path d="M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" />
      <path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" />
    </>
  ),
  read: (
    <>
      <path d="M2 6.5C5 5 8 5 12 7c4-2 7-2 10-.5v12c-3-1.5-6-1.5-10 .5-4-2-7-2-10-.5z" />
      <path d="M12 7v12" />
    </>
  ),
  move: (
    <>
      <circle cx="13" cy="4.5" r="1.8" />
      <path d="M6 20l4-7 3 2 3-4-3-3-5 3" /><path d="M13 13l4 2 2 5" />
    </>
  ),
  practice: (
    <>
      <path d="M9 3h6l1 4H8z" /><path d="M6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1z" />
      <path d="m9.5 14 2 2 3.5-4" />
    </>
  ),
  flag: (
    <>
      <path d="M5 21V4" />
      <path d="M5 4h11l-1.5 3.5L16 11H5" />
    </>
  ),
  phone: <path d="M6.6 3h3l1.7 4.2-2.2 1.7a11 11 0 0 0 5.9 5.9l1.7-2.2 4.2 1.7v3A2.4 2.4 0 0 1 18.6 20 16.6 16.6 0 0 1 4 5.4 2.4 2.4 0 0 1 6.6 3z" />,
  telegram: <path d="M21 4.5 3.5 11.3c-.9.4-.9 1.2 0 1.5l4.3 1.4 1.7 5.3c.2.6.9.8 1.4.3l2.5-2.4 4.4 3.2c.7.4 1.4 0 1.6-.8L22 5.8c.2-.9-.4-1.5-1-1.3zM8.5 14l9-6.5-7 7.5" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r=".8" fill="currentColor" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-7-6.4-7-11.5a7 7 0 0 1 14 0C19 14.6 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7.5" />,
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  arrowDown: <path d="M12 5v14m-6-6 6 6 6-6" />,
  spark: <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4m11.4-11.4 1.4-1.4" />
    </>
  ),
  moon: <path d="M20.5 14.6A8.5 8.5 0 0 1 9.4 3.5a8.5 8.5 0 1 0 11.1 11.1z" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  timer: (
    <>
      <circle cx="12" cy="13" r="8" /><path d="M12 9v4l2.5 1.5M9 2h6" />
    </>
  ),
};

export type IconName = keyof typeof PATHS;

export function Icon({ name, className = "size-6", ...props }: { name: IconName; className?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
