import Link from "next/link";
import { Footprint } from "./Footprint";

export function Logo({ compact = false, onDark = false }: { compact?: boolean; onDark?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="STEP SCHOOL KIDS — bosh sahifa">
      <span className="relative grid size-10 place-items-center rounded-[14px] bg-ink text-sun shadow-[0_6px_16px_-6px_rgba(20,35,43,0.5)] transition-transform duration-300 group-hover:-rotate-6">
        <Footprint className="size-6 fill-current" />
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.25rem] font-semibold tracking-tight ${onDark ? "text-white" : "text-ink"}`}>
          STEP<span className="text-green">.</span>
        </span>
        {!compact && (
          <span className={`text-[0.62rem] font-extrabold uppercase tracking-[0.22em] ${onDark ? "text-white/60" : "text-ink-mute"}`}>
            School Kids
          </span>
        )}
      </span>
    </Link>
  );
}
