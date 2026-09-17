"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Book as BookCard } from "@/components/brand/Book";
import { Footprint } from "@/components/brand/Footprint";
import { Riko } from "@/components/brand/Riko";
import { BOOKS } from "@/content/books";
import { EASE_OUT_EXPO, usePrefersReducedMotion } from "@/lib/motion";
import { useTheme } from "@/lib/theme";

const WORDS = ["START", "SPEAK", "READ", "WIN"];
const BG_STOPS = [0, 0.33, 0.66, 1];
const BG_DARK = ["#050a17", "#0a1a3f", "#082a2c", "#050a17"];
const BG_LIGHT = ["#f7f9ff", "#e4edff", "#e2f6ec", "#f7f9ff"];

/** Footprints along the stage path (percent of stage width / height). */
const PRINTS = [4, 13, 22, 31, 40, 49, 58, 67, 76, 85].map((x, i) => ({ x, y: 78 - (i % 2) * 10, r: i % 2 ? 10 : -8 }));

/**
 * Sticky scroll scene: START → SPEAK → READ → WIN.
 * 400vh of scroll drives one continuous stage: word, colour, Riko position, footprint trail.
 */
export function Journey() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const theme = useTheme();
  const [active, setActive] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(BOOKS.length - 1, Math.max(0, Math.floor(v * BOOKS.length)));
    if (i !== active) setActive(i);
  });

  const bgDark = useTransform(scrollYProgress, BG_STOPS, BG_DARK);
  const bgLight = useTransform(scrollYProgress, BG_STOPS, BG_LIGHT);
  const palette = theme === "light" ? BG_LIGHT : BG_DARK;
  const bg = theme === "light" ? bgLight : bgDark;
  const rikoLeft = useTransform(scrollYProgress, [0.02, 0.98], ["2%", "74%"]);
  const trail = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const book = BOOKS[active];

  return (
    <section ref={ref} id="yol" className="relative h-[400vh]" aria-labelledby="journey-title">
      <motion.div style={{ background: reduced ? palette[0] : bg }} className="grain sticky top-0 h-svh overflow-hidden">
        {/* tone glow */}
        <AnimatePresence>
          <motion.div
            key={book.key}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="pointer-events-none absolute -right-[10%] top-[10%] h-[70vmin] w-[70vmin] rounded-full blur-3xl"
            style={{ background: `radial-gradient(circle, ${book.color}66, transparent 62%)` }}
            aria-hidden="true"
          />
        </AnimatePresence>
        <div className="bg-footprints pointer-events-none absolute inset-0" aria-hidden="true" />

        <div className="container-x relative flex h-full flex-col pt-24 pb-[calc(30svh+64px)] sm:pb-[30svh] lg:pt-28 lg:pb-[32svh]">
          {/* header row */}
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="eyebrow">
                <Footprint className="size-3 fill-current" />
                Birinchi qadam
              </p>
              <h2 id="journey-title" className="headline mt-3 text-[clamp(1.4rem,3.2vw,2rem)] text-ink/90">
                Bir yil. To‘rt qadam.
              </h2>
            </div>
            <p className="font-display text-sm font-semibold text-ink/50 tabular-nums" aria-live="polite">
              0{active + 1} <span className="text-ink/25">/ 0{BOOKS.length}</span>
            </p>
          </div>

          {/* kinetic word */}
          <div className="relative my-auto flex items-end justify-between gap-6 sm:mt-auto sm:mb-0 sm:gap-8">
            <div className="min-w-0 flex-1">
              <div className="relative h-[clamp(3.6rem,16vw,15rem)] overflow-hidden" aria-hidden="true">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={active}
                    className={`headline-xl absolute bottom-0 left-0 whitespace-nowrap text-[clamp(3.2rem,15vw,14rem)] ${book.textClass}`}
                    style={theme === "light" ? { color: book.color } : undefined} // pastel tints suit navy; light mode uses the saturated cover colour
                    initial={{ y: reduced ? 0 : "70%", opacity: 0 }}
                    animate={{ y: "0%", opacity: 1 }}
                    exit={{ y: reduced ? 0 : "-70%", opacity: 0 }}
                    transition={{ duration: 0.65, ease: EASE_OUT_EXPO }}
                  >
                    {WORDS[active]}
                  </motion.p>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`c-${active}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="mt-3"
                >
                  <p className="font-display text-[clamp(1.1rem,3.4vw,1.8rem)] font-semibold text-ink">{book.concept}</p>
                  <p className="mt-1 text-sm font-semibold text-ink/50">
                    Step 0{book.step} · {book.title}
                  </p>
                </motion.div>
              </AnimatePresence>
              {/* sr summary for assistive tech */}
              <ol className="sr-only">
                {BOOKS.map((b) => (
                  <li key={b.step}>
                    {b.title} — {b.concept}
                  </li>
                ))}
              </ol>
            </div>

            {/* book cover (tablet+) */}
            <div className="book-scene relative aspect-[3/4] w-[clamp(84px,22vw,200px)] shrink-0">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={`b-${active}`}
                  initial={{ opacity: 0, rotateY: reduced ? 0 : -40, x: reduced ? 0 : 40 }}
                  animate={{ opacity: 1, rotateY: -12, x: 0 }}
                  exit={{ opacity: 0, rotateY: reduced ? 0 : 30, x: reduced ? 0 : -30 }}
                  transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                  className="book-3d absolute inset-0"
                >
                  <BookCard book={book} sizes="(max-width: 640px) 25vw, 200px" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* stage: path + trail + Riko */}
        <div className="pointer-events-none absolute inset-x-0 bottom-16 h-[30svh] sm:bottom-0 lg:h-[32svh]" aria-hidden="true">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            <path d="M0 235 C 200 205, 300 265, 500 235 S 800 205, 1000 235" fill="none" className="stroke-line" strokeWidth="2" strokeDasharray="5 12" vectorEffect="non-scaling-stroke" />
            <motion.path
              d="M0 235 C 200 205, 300 265, 500 235 S 800 205, 1000 235"
              fill="none"
              stroke="rgba(47,214,127,0.55)"
              strokeWidth="2"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: reduced ? 1 : trail }}
            />
          </svg>
          {PRINTS.map((p, i) => (
            <TrailPrint key={i} p={p} at={i / PRINTS.length} progress={scrollYProgress} reduced={reduced} />
          ))}
          <motion.div style={{ left: reduced ? "50%" : rikoLeft }} className="absolute bottom-[6%] w-[clamp(96px,20vw,210px)] -translate-x-1/2 lg:translate-x-0">
            <div className="absolute inset-x-[10%] bottom-0 h-[16%] rounded-full blur-md" style={{ background: `radial-gradient(ellipse, ${book.color}66, transparent 70%)` }} />
            <div className={`relative ${reduced ? "" : "anim-bob"}`} style={{ aspectRatio: "1130 / 1280" }}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={book.key}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
                  className="absolute inset-0"
                >
                  <Riko variant={book.key} decorative sizes="(max-width: 640px) 30vw, 220px" className="w-full drop-shadow-[0_30px_40px_var(--shadow-deep)]" />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-canvas" />
        </div>

        {/* progress */}
        <div className="absolute right-5 top-1/2 hidden -translate-y-1/2 flex-col gap-2 lg:flex" aria-hidden="true">
          {BOOKS.map((b, i) => (
            <span key={b.step} className={`h-8 w-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-green" : "bg-ink/15"}`} />
          ))}
        </div>
      </motion.div>
    </section>
  );
}

function TrailPrint({ p, at, progress, reduced }: { p: { x: number; y: number; r: number }; at: number; progress: ReturnType<typeof useScroll>["scrollYProgress"]; reduced: boolean }) {
  const opacity = useTransform(progress, [Math.max(0, at - 0.05), at + 0.02], [0.12, 0.9]);
  const scale = useTransform(progress, [Math.max(0, at - 0.05), at + 0.02], [0.6, 1]);
  return (
    <motion.span
      className="absolute w-[clamp(18px,2.6vw,30px)]"
      style={{ left: `${p.x}%`, top: `${p.y}%`, rotate: p.r, opacity: reduced ? 0.8 : opacity, scale: reduced ? 1 : scale }}
    >
      <Footprint className="w-full fill-green drop-shadow-[0_0_10px_rgba(47,214,127,0.6)]" />
    </motion.span>
  );
}
