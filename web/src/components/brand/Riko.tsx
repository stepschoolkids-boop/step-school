import type { SVGProps } from "react";

type RikoProps = SVGProps<SVGSVGElement> & {
  /** Enables idle micro-animations (blink, tail wag, waving hand). */
  animated?: boolean;
  /** Accessible label; omit for decorative usage. */
  label?: string;
};

/**
 * Riko — the STEP SCHOOL KIDS dinosaur mascot, drawn as a clean geometric SVG
 * so it scales from a 24px avatar to a full hero illustration.
 * Facing right = always moving forward, one STEP at a time.
 */
export function Riko({ className, animated = false, label, ...props }: RikoProps) {
  const a = (name: string) => (animated ? name : undefined);
  return (
    <svg
      viewBox="0 0 420 420"
      className={className}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...props}
    >
      <defs>
        <linearGradient id="riko-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3fc484" />
          <stop offset="1" stopColor="#1f9a5f" />
        </linearGradient>
        <linearGradient id="riko-belly" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f7e4" />
          <stop offset="1" stopColor="#a9e6c3" />
        </linearGradient>
      </defs>

      {/* shadow */}
      <ellipse cx="210" cy="392" rx="120" ry="14" fill="#14232b" opacity="0.12" />

      {/* tail */}
      <g className={a("anim-tail")}>
        <path
          d="M128 292 C 70 296, 26 262, 34 206 C 38 176, 62 160, 86 168 C 66 178, 56 204, 70 232 C 84 258, 108 268, 140 266 Z"
          fill="url(#riko-body)"
        />
        <path d="M60 196 l-14 -30 l24 16 Z" fill="#ffc233" />
        <path d="M46 228 l-22 -22 l30 8 Z" fill="#ffc233" />
      </g>

      {/* back leg */}
      <rect x="150" y="300" width="52" height="82" rx="26" fill="#1f9a5f" />
      <ellipse cx="180" cy="380" rx="40" ry="14" fill="#1f9a5f" />

      {/* body */}
      <ellipse cx="212" cy="286" rx="104" ry="90" fill="url(#riko-body)" />
      <ellipse cx="222" cy="304" rx="64" ry="60" fill="url(#riko-belly)" />
      <path d="M170 262 h100" stroke="#8fd9b2" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M176 282 h92" stroke="#8fd9b2" strokeWidth="3" strokeLinecap="round" opacity="0.7" />
      <path d="M182 302 h80" stroke="#8fd9b2" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

      {/* spots */}
      <circle cx="150" cy="240" r="9" fill="#147a4a" opacity="0.55" />
      <circle cx="132" cy="276" r="6" fill="#147a4a" opacity="0.55" />
      <circle cx="292" cy="256" r="7" fill="#147a4a" opacity="0.4" />

      {/* front leg */}
      <rect x="226" y="306" width="54" height="80" rx="27" fill="url(#riko-body)" />
      <ellipse cx="258" cy="382" rx="42" ry="15" fill="#23a867" />
      <ellipse cx="228" cy="384" rx="8" ry="6" fill="#fff8ec" />
      <ellipse cx="258" cy="388" rx="8" ry="6" fill="#fff8ec" />
      <ellipse cx="288" cy="384" rx="8" ry="6" fill="#fff8ec" />

      {/* neck + head */}
      <path d="M232 214 C 236 178, 262 152, 300 150 L 320 214 Z" fill="url(#riko-body)" />
      <circle cx="286" cy="134" r="78" fill="url(#riko-body)" />
      {/* snout */}
      <ellipse cx="346" cy="160" rx="52" ry="40" fill="#3fc484" />
      <ellipse cx="368" cy="150" rx="6" ry="4" fill="#147a4a" />
      <ellipse cx="384" cy="160" rx="6" ry="4" fill="#147a4a" />
      {/* smile */}
      <path d="M322 186 Q 356 204 388 182" stroke="#147a4a" strokeWidth="6" strokeLinecap="round" fill="none" />
      <circle cx="326" cy="192" r="8" fill="#ff9a86" opacity="0.7" />

      {/* head spikes */}
      <path d="M236 78 l14 -36 l20 30 Z" fill="#ffc233" />
      <path d="M266 62 l8 -40 l22 30 Z" fill="#ffc233" />
      <path d="M298 62 l4 -38 l22 34 Z" fill="#ffc233" />

      {/* eyes */}
      <g>
        <ellipse cx="300" cy="118" rx="24" ry="26" fill="#fff" />
        <ellipse cx="262" cy="122" rx="15" ry="17" fill="#fff" />
        <g className={a("anim-blink")}>
          <circle cx="306" cy="122" r="12" fill="#14232b" />
          <circle cx="311" cy="116" r="4" fill="#fff" />
          <circle cx="266" cy="125" r="7.5" fill="#14232b" />
          <circle cx="269" cy="121" r="2.6" fill="#fff" />
        </g>
      </g>

      {/* waving arm */}
      <g className={a("anim-wave")}>
        <path
          d="M296 252 C 330 258, 362 252, 384 232"
          stroke="#23a867"
          strokeWidth="24"
          strokeLinecap="round"
          fill="none"
        />
        <circle cx="388" cy="228" r="15" fill="#3fc484" />
        <circle cx="398" cy="218" r="5" fill="#3fc484" />
        <circle cx="402" cy="230" r="5" fill="#3fc484" />
      </g>
      {/* other arm */}
      <path d="M168 258 C 150 270, 146 292, 158 304" stroke="#1f9a5f" strokeWidth="22" strokeLinecap="round" fill="none" />
    </svg>
  );
}
