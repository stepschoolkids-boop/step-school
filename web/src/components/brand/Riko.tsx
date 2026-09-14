import Image from "next/image";
import { ASSETS, type RikoVariant } from "@/content/assets";

type RikoProps = {
  /** Which official Riko to show. Each book has its own; `hero` is the main character. */
  variant: RikoVariant;
  className?: string;
  /** Load eagerly (hero only). */
  priority?: boolean;
  /** Responsive sizes hint for next/image. */
  sizes?: string;
  /** Decorative usage hides the image from assistive tech. */
  decorative?: boolean;
  /** Idle bob (transform only). Off under reduced motion via CSS. */
  idle?: boolean;
};

/**
 * Riko — the official STEP SCHOOL KIDS mascot, rendered from the asset registry.
 * Never hand-drawn, never CSS-recreated: one component, five official poses.
 */
export function Riko({ variant, className = "", priority = false, sizes = "(max-width: 640px) 60vw, 420px", decorative = false, idle = false }: RikoProps) {
  const asset = ASSETS.riko[variant];
  return (
    <span className={`relative block ${idle ? "anim-bob" : ""} ${className}`} style={{ aspectRatio: `${asset.width} / ${asset.height}` }}>
      <Image
        src={asset.src}
        alt={decorative ? "" : asset.alt}
        aria-hidden={decorative || undefined}
        fill
        priority={priority}
        sizes={sizes}
        className="object-contain"
        draggable={false}
      />
    </span>
  );
}
