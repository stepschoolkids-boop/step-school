import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/content/assets";

/**
 * Official STEP SCHOOL KIDS logo — the exact provided asset, never redrawn.
 * `compact` switches to the paw mark for tight spaces.
 */
export function Logo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  const asset = compact ? ASSETS.brand.logoMark : ASSETS.brand.logo;
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="STEP SCHOOL KIDS — bosh sahifa">
      <Image
        src={asset.src}
        alt={asset.alt}
        width={asset.width}
        height={asset.height}
        priority
        sizes="(max-width: 640px) 140px, 180px"
        className={compact ? "h-10 w-auto" : "h-10 w-auto sm:h-11"}
        draggable={false}
      />
    </Link>
  );
}
