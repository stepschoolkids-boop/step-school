"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { BOOKS } from "@/content/books";
import { FACTS } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/motion";

const DOT = ["bg-green", "bg-blue-light", "bg-sun", "bg-[#ff9a7a]"];

/** 1 YIL · 156 DARS — giant kinetic numbers, then the four stages as a progress line. */
export function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 45%"] });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative overflow-hidden bg-navy-950 py-24 sm:py-32" aria-labelledby="stats-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-[20%] top-0 h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.14),transparent_60%)]" />
      </div>
      <div className="container-x relative">
        <h2 id="stats-title" className="sr-only">
          Bir yillik dastur: {FACTS.years} yil, {FACTS.lessons} dars, {FACTS.books} kitob
        </h2>

        <div className="grid items-end gap-8 lg:grid-cols-[auto_auto_1fr] lg:gap-14">
          <Reveal>
            <p className="eyebrow">
              <Footprint className="size-3 fill-current" />
              Bir yillik dastur
            </p>
            <p className="headline-xl mt-3 bg-gradient-to-br from-white to-white/60 bg-clip-text text-[clamp(6rem,26vw,15rem)] text-transparent">
              <CountUp to={FACTS.years} />
              <span className="ml-3 align-top font-display text-[clamp(1rem,3.4vw,1.8rem)] font-bold uppercase tracking-[0.2em] text-green">yil</span>
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="headline-xl bg-gradient-to-br from-blue-light to-green bg-clip-text text-[clamp(6rem,26vw,15rem)] text-transparent">
              <CountUp to={FACTS.lessons} />
              <span className="ml-3 align-top font-display text-[clamp(1rem,3.4vw,1.8rem)] font-bold uppercase tracking-[0.2em] text-white/70">dars</span>
            </p>
          </Reveal>
          <Reveal delay={0.18} className="max-w-sm lg:pb-6">
            <p className="text-pretty text-lg leading-relaxed text-white/65">
              Birinchi so‘zdan erkin nutqqa. Har kitob avvalgisining ustiga quriladi — bola keyingi pog‘onaga tayyor holda o‘tadi.
            </p>
          </Reveal>
        </div>

        {/* stages line */}
        <div ref={ref} className="mt-16 sm:mt-20">
          <div className="relative mx-3 h-1 rounded-full bg-white/10">
            <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#2fd67f,#8fc0ff,#ffc233,#ff9a7a)]" style={{ width: reduced ? "100%" : fill }} />
          </div>
          <ol className="mt-[-0.9rem] grid grid-cols-2 gap-y-8 sm:grid-cols-4">
            {BOOKS.map((b, i) => (
              <li key={b.step} className="px-3">
                <Reveal delay={i * 0.08}>
                  <span className={`grid size-7 place-items-center rounded-full border-[3px] border-navy-950 ${DOT[i]} text-navy-950`}>
                    <Footprint className="size-3.5 fill-current" />
                  </span>
                  <p className="mt-4 text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-white/40">Step 0{b.step}</p>
                  <p className="mt-1 font-display text-[1.05rem] font-semibold text-white">{b.concept}</p>
                  <p className="text-sm text-white/50">{b.title}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
