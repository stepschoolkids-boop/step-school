import Image from "next/image";
import Link from "next/link";
import { ASSETS } from "@/content/assets";

/**
 * Official STEP SCHOOL KIDS logo — the exact provided asset, never redrawn.
 * The wordmark is white, so light mode swaps in the navy-lettered variant
 * (same artwork, letters recoloured). `compact` switches to the paw mark.
 */
export function Logo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  if (compact) {
    const mark = ASSETS.brand.logoMark;
    return (
      <Link href="/" className={`inline-flex items-center ${className}`} aria-label="STEP SCHOOL KIDS — bosh sahifa">
        <Image src={mark.src} alt={mark.alt} width={mark.width} height={mark.height} priority sizes="44px" className="h-10 w-auto" draggable={false} />
      </Link>
    );
  }
  const dark = ASSETS.brand.logo;
  const light = ASSETS.brand.logoLight;
  return (
    <Link href="/" className={`inline-flex items-center ${className}`} aria-label="STEP SCHOOL KIDS — bosh sahifa">
      <Image src={dark.src} alt={dark.alt} width={dark.width} height={dark.height} priority sizes="(max-width: 640px) 140px, 180px" className="h-10 w-auto sm:h-11 light:hidden" draggable={false} />
      <Image src={light.src} alt={light.alt} width={light.width} height={light.height} loading="eager" sizes="(max-width: 640px) 140px, 180px" className="hidden h-10 w-auto sm:h-11 light:block" draggable={false} />
    </Link>
  );
}
