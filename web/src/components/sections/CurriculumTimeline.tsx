"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { CountUp } from "@/components/ui/CountUp";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BOOKS } from "@/content/books";
import { FACTS } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/motion";

const DOT = ["bg-green", "bg-sky", "bg-sun", "bg-coral"];

export function CurriculumTimeline() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 55%"] });
  const fill = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative py-20 sm:py-28" aria-labelledby="curriculum-title">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <SectionHeading
            eyebrow="Bir yillik dastur"
            id="curriculum-title"
            title={
              <>
                <span className="text-green">1 yil</span> ichida — birinchi so‘zdan erkin nutqqa
              </>
            }
            text="Dastur to‘rt kitobga bo‘lingan. Har kitob avvalgisining ustiga quriladi — bola bir pog‘onadan keyingisiga tayyor holda o‘tadi."
          />

          <dl className="grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { v: FACTS.years, l: "yil", s: "" },
              { v: FACTS.lessons, l: "dars", s: "" },
              { v: FACTS.books, l: "kitob", s: "" },
            ].map((s, i) => (
              <Reveal key={s.l} delay={i * 0.08} className="card p-5 text-center sm:p-7">
                <dt className="order-2 text-xs font-extrabold uppercase tracking-[0.18em] text-ink-mute">{s.l}</dt>
                <dd className="headline text-[clamp(2.4rem,7vw,4.2rem)] text-ink">
                  <CountUp to={s.v} suffix={s.s} />
                </dd>
              </Reveal>
            ))}
          </dl>
        </div>

        {/* timeline */}
        <div ref={ref} className="relative mt-16">
          {/* horizontal (desktop) */}
          <div className="hidden lg:block">
            <div className="relative mx-6 h-2 rounded-full bg-ink/10">
              <motion.div className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#23a867,#45b6e6,#ffc233,#ff6a3d)]" style={{ width: reduced ? "100%" : fill }} />
            </div>
            <ol className="mt-[-1.6rem] grid grid-cols-4">
              {BOOKS.map((b, i) => (
                <li key={b.step} className="px-6">
                  <Reveal delay={i * 0.1}>
                    <span className={`grid size-10 place-items-center rounded-full border-4 border-cream ${DOT[i]} text-white shadow-[var(--shadow-card)]`}>
                      <Footprint className="size-5 fill-current" />
                    </span>
                    <p className="mt-5 text-xs font-extrabold uppercase tracking-[0.2em] text-ink-mute">Step 0{b.step}</p>
                    <p className="font-display text-2xl font-semibold">{b.concept}</p>
                    <p className="mt-1 text-ink-soft">{b.title}</p>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>

          {/* vertical (mobile) */}
          <ol className="relative grid gap-8 pl-12 lg:hidden">
            <div className="absolute bottom-0 left-[1.1rem] top-0 w-1 rounded-full bg-ink/10" aria-hidden="true">
              <motion.div className="w-full rounded-full bg-[linear-gradient(180deg,#23a867,#45b6e6,#ffc233,#ff6a3d)]" style={{ height: reduced ? "100%" : fill }} />
            </div>
            {BOOKS.map((b, i) => (
              <li key={b.step} className="relative">
                <span className={`absolute -left-12 top-0 grid size-10 place-items-center rounded-full border-4 border-cream ${DOT[i]} text-white`}>
                  <Footprint className="size-5 fill-current" />
                </span>
                <Reveal delay={i * 0.06}>
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink-mute">Step 0{b.step}</p>
                  <p className="font-display text-2xl font-semibold">{b.concept}</p>
                  <p className="text-ink-soft">{b.title}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
