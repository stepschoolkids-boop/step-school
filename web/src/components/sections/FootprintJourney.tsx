"use client";

import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Riko } from "@/components/brand/Riko";
import { BookCover } from "@/components/brand/BookCover";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BOOKS, type BookTone } from "@/content/books";
import { FACTS } from "@/content/site";
import { usePrefersReducedMotion } from "@/lib/motion";

const TONE: Record<BookTone, { chip: string; ring: string; text: string; glow: string }> = {
  green: { chip: "bg-green text-white", ring: "border-green", text: "text-green", glow: "#23a867" },
  sky: { chip: "bg-sky text-white", ring: "border-sky", text: "text-sky", glow: "#45b6e6" },
  sun: { chip: "bg-sun text-ink", ring: "border-sun", text: "text-sun", glow: "#ffc233" },
  coral: { chip: "bg-coral text-white", ring: "border-coral", text: "text-coral", glow: "#ff6a3d" },
};

/** Footprints along the winding path — (left %, top %, rotation, mirrored) */
const PRINTS = [
  { x: 50, y: 3, r: 0, m: false },
  { x: 38, y: 11, r: -14, m: true },
  { x: 30, y: 20, r: -22, m: false },
  { x: 42, y: 29, r: 4, m: true },
  { x: 60, y: 37, r: 18, m: false },
  { x: 70, y: 46, r: 22, m: true },
  { x: 58, y: 55, r: 6, m: false },
  { x: 40, y: 63, r: -16, m: true },
  { x: 30, y: 72, r: -20, m: false },
  { x: 42, y: 81, r: -4, m: true },
  { x: 54, y: 90, r: 10, m: false },
  { x: 50, y: 98, r: 0, m: true },
];

export function FootprintJourney() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 70%", "end 60%"] });
  const pathLength = useTransform(scrollYProgress, [0, 1], [0, 1]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const idx = Math.min(BOOKS.length - 1, Math.floor(v * BOOKS.length));
    if (idx !== active) setActive(idx);
  });

  const book = BOOKS[active];
  const tone = TONE[book.tone];

  return (
    <section id="kurs" className="relative isolate overflow-x-clip bg-ink py-20 text-white sm:py-28" aria-labelledby="journey-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-40 top-0 h-[60vmin] w-[60vmin] rounded-full bg-green/15 blur-3xl" />
        <div className="absolute -right-40 bottom-0 h-[60vmin] w-[60vmin] rounded-full bg-coral/15 blur-3xl" />
      </div>

      <div className="container-x">
        <SectionHeading
          tone="dark"
          eyebrow="Yo‘l xaritasi"
          id="journey-title"
          title={
            <>
              Bir yil. To‘rt qadam. <span className="text-sun">Bitta katta natija.</span>
            </>
          }
          text={`Har bir kitob — bolaning ingliz tilidagi keyingi qadami. ${FACTS.lessons} dars davomida Riko bola bilan birga yuradi: birinchi so‘zlardan erkin nutqqa.`}
        />

        <div ref={ref} className="mt-16 grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          {/* sticky guide (desktop) */}
          <div className="hidden lg:block">
            <div className="sticky top-28">
              <div className="relative overflow-hidden rounded-[var(--radius-2xl)] border border-white/10 bg-white/[0.04] p-8">
                <div
                  className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl transition-colors duration-700"
                  style={{ background: tone.glow, opacity: 0.35 }}
                  aria-hidden="true"
                />
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/60">Hozirgi qadam</p>
                <div className="mt-3 flex items-end gap-3">
                  <motion.span
                    key={active}
                    initial={{ opacity: 0, y: reduced ? 0 : 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className={`headline text-[6rem] leading-none ${tone.text}`}
                  >
                    0{book.step}
                  </motion.span>
                  <span className="mb-4 text-white/50">/ 0{BOOKS.length}</span>
                </div>
                <motion.div key={`t-${active}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
                  <p className="font-display text-3xl font-semibold">{book.title}</p>
                  <p className="mt-1 text-lg text-white/70">{book.concept}</p>
                </motion.div>

                <div className="mt-8 flex gap-2" aria-hidden="true">
                  {BOOKS.map((b, i) => (
                    <span
                      key={b.step}
                      className={`h-1.5 flex-1 rounded-full transition-colors duration-500 ${i <= active ? TONE[b.tone].chip : "bg-white/15"}`}
                    />
                  ))}
                </div>

                <div className="relative mt-6 h-44">
                  <Riko className="absolute bottom-0 left-1/2 w-52 -translate-x-1/2 drop-shadow-[0_20px_30px_rgba(0,0,0,0.4)]" />
                </div>
              </div>
            </div>
          </div>

          {/* path + steps */}
          <div className="relative">
            {/* winding path */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 lg:left-0 lg:w-40" aria-hidden="true">
              <svg viewBox="0 0 100 1000" preserveAspectRatio="none" className="h-full w-full">
                <path
                  d="M50 0 C 50 90, 26 110, 26 220 S 74 340, 74 470 S 26 600, 26 740 S 50 860, 50 1000"
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="3"
                  strokeDasharray="6 10"
                  vectorEffect="non-scaling-stroke"
                />
                <motion.path
                  d="M50 0 C 50 90, 26 110, 26 220 S 74 340, 74 470 S 26 600, 26 740 S 50 860, 50 1000"
                  fill="none"
                  stroke="#ffc233"
                  strokeWidth="3"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ pathLength: reduced ? 1 : pathLength }}
                />
              </svg>
              {PRINTS.map((p, i) => (
                <PrintMark key={i} p={p} index={i} total={PRINTS.length} progress={scrollYProgress} reduced={reduced} />
              ))}
            </div>

            <ol className="ml-16 grid gap-6 sm:ml-24 sm:gap-10 lg:ml-40">
              {BOOKS.map((b, i) => {
                const t = TONE[b.tone];
                return (
                  <li key={b.step} className="lg:min-h-[46vh]">
                    <Reveal className="h-full">
                      <article
                        className={`relative h-full overflow-hidden rounded-[var(--radius-xl)] border bg-white/[0.04] p-6 transition-colors duration-500 sm:p-8 ${
                          active === i ? t.ring + " border-opacity-60" : "border-white/10"
                        }`}
                      >
                        <Footprint className={`absolute -right-6 -top-6 w-32 rotate-12 fill-white/[0.05]`} />
                        <div className="book-scene absolute bottom-6 right-6 hidden w-28 sm:block lg:w-36">
                          <BookCover book={b} />
                        </div>
                        <div className="flex flex-wrap items-center gap-3 sm:pr-36 lg:pr-44">
                          <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${t.chip}`}>
                            Step 0{b.step}
                          </span>
                          <span className="text-sm font-semibold text-white/60">{b.conceptEn}</span>
                        </div>
                        <h3 className="headline mt-5 text-[clamp(2rem,6vw,3.2rem)] sm:pr-36 lg:pr-44">{b.title}</h3>
                        <p className={`mt-1 font-display text-xl font-semibold ${t.text}`}>{b.concept}</p>
                        <p className="mt-4 max-w-md text-pretty leading-relaxed text-white/75 sm:pr-36 lg:pr-44">{b.promise}</p>
                      </article>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

function PrintMark({
  p,
  index,
  total,
  progress,
  reduced,
}: {
  p: { x: number; y: number; r: number; m: boolean };
  index: number;
  total: number;
  progress: ReturnType<typeof useScroll>["scrollYProgress"];
  reduced: boolean;
}) {
  const at = index / total;
  const opacity = useTransform(progress, [Math.max(0, at - 0.04), at + 0.02], [0.18, 1]);
  const scale = useTransform(progress, [Math.max(0, at - 0.04), at + 0.02], [0.7, 1]);
  return (
    <motion.span
      className="absolute w-[34%]"
      style={{
        left: `${p.x}%`,
        top: `${p.y}%`,
        translateX: "-50%",
        translateY: "-50%",
        rotate: p.r,
        scaleX: p.m ? -1 : 1,
        opacity: reduced ? 1 : opacity,
        scale: reduced ? 1 : scale,
      }}
    >
      <Footprint className="w-full fill-sun" />
    </motion.span>
  );
}
