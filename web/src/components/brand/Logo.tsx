import Link from "next/link";
import { Footprint } from "./Footprint";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="group inline-flex items-center gap-2.5" aria-label="STEP SCHOOL KIDS — bosh sahifa">
      <span className="relative grid size-10 place-items-center rounded-[14px] bg-green text-navy-950 shadow-[0_8px_24px_-8px_var(--green-glow)] transition-transform duration-300 group-hover:-rotate-6">
        <Footprint className="size-6 fill-current" />
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-display text-[1.05rem] font-bold tracking-tight text-white">STEP</span>
        {!compact && <span className="mt-0.5 text-[0.58rem] font-extrabold uppercase tracking-[0.24em] text-white/55">School Kids</span>}
      </span>
    </Link>
  );
}
