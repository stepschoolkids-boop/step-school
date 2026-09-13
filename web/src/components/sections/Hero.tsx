"use client";

import Link from "next/link";
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { useRef, type PointerEvent } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Riko } from "@/components/brand/Riko";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CTA } from "@/content/nav";
import { FACTS, SITE } from "@/content/site";
import { EASE, EASE_OUT_EXPO, useFinePointer, useMediaQuery, usePrefersReducedMotion } from "@/lib/motion";

const LETTERS = ["S", "T", "E", "P"];

/** Footprint trail in a 400×400 art box: the first print appears alone, then the path forms. */
const PATH = "M38 384 C 104 376, 146 334, 196 302 S 246 272, 268 262";
const PRINTS = [
  { x: 40, y: 380, r: -24, s: 9 },
  { x: 88, y: 360, r: -12, s: 9.5 },
  { x: 134, y: 333, r: 2, s: 10 },
  { x: 178, y: 306, r: -6, s: 10.5 },
  { x: 222, y: 284, r: 8, s: 11 },
  { x: 258, y: 266, r: 0, s: 11.5 },
];

const FLOATERS = [
  { text: "Hello!", x: "8%", y: "10%", r: -6, d: 0 },
  { text: "A · B · C", x: "66%", y: "2%", r: 5, d: 1.4 },
  { text: "I can read", x: "2%", y: "52%", r: -3, d: 0.8 },
];

/** Deterministic particle field (hydration-safe). Transform-only animation. */
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: (i * 53 + 7) % 100,
  y: (i * 37 + 11) % 100,
  s: 2 + (i % 3),
  o: 0.18 + (i % 4) * 0.08,
  t: 14 + (i % 5) * 3,
  d: -(i * 1.7),
  dx: i % 2 ? 16 : -12,
  dy: -(22 + (i % 4) * 10),
  green: i % 3 === 0,
}));

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const fine = useFinePointer();
  const desktop = useMediaQuery("(min-width: 1024px)");

  // Choreography scale: full on desktop, 22% faster on phones, instant with reduced motion.
  const k = reduced ? 0 : desktop ? 1 : 0.78;
  const t = (s: number) => s * k;
  const d = (s: number) => (reduced ? 0.01 : s);

  // Pointer parallax + glow (fine pointers only)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 18, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 50, damping: 18, mass: 0.6 });
  const glowLeft = useTransform(sx, (v) => `${50 + v * 42}%`);
  const glowTop = useTransform(sy, (v) => `${50 + v * 42}%`);
  const farX = useTransform(sx, (v) => v * -16);
  const farY = useTransform(sy, (v) => v * -12);
  const nearX = useTransform(sx, (v) => v * 22);
  const nearY = useTransform(sy, (v) => v * 16);

  const onPointerMove = (e: PointerEvent) => {
    if (!fine || reduced || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
  };

  // Scroll parallax
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 140]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 60]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="hero"
      onPointerMove={onPointerMove}
      className="grain relative isolate overflow-hidden bg-navy-950"
      aria-labelledby="hero-title"
    >
      {/* Ambient background — enters after the first footprint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: t(0.9), duration: d(1.6), ease: "easeOut" }}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <motion.div style={{ x: farX, y: farY }} className="absolute inset-0">
          <div className="anim-breathe absolute -left-[18%] -top-[22%] h-[80vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle,rgba(61,139,255,0.34),transparent_62%)]" />
          <div className="anim-breathe absolute -right-[14%] bottom-[-24%] h-[76vmin] w-[76vmin] rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.26),transparent_62%)]" style={{ animationDelay: "-7s" }} />
          <div className="absolute left-[38%] top-[30%] h-[40vmin] w-[40vmin] rounded-full bg-[radial-gradient(circle,rgba(143,192,255,0.12),transparent_60%)]" />
        </motion.div>
        <div className="bg-footprints absolute inset-0" />
        <div className="absolute inset-0">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`anim-drift absolute rounded-full ${p.green ? "bg-green" : "bg-blue-light"}`}
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: p.s,
                height: p.s,
                ["--o" as string]: p.o,
                ["--t" as string]: `${p.t}s`,
                ["--d" as string]: `${p.d}s`,
                ["--dx" as string]: `${p.dx}px`,
                ["--dy" as string]: `${p.dy}px`,
                boxShadow: p.green ? "0 0 10px rgba(47,214,127,0.7)" : "0 0 10px rgba(143,192,255,0.6)",
              }}
            />
          ))}
        </div>
        {fine && !reduced && (
          <motion.div
            style={{ left: glowLeft, top: glowTop }}
            className="absolute h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(61,139,255,0.2),transparent_60%)]"
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-950" />
      </motion.div>

      <div className="container-x grid min-h-[100svh] grid-rows-[auto_1fr] gap-4 pt-[80px] pb-16 lg:grid-cols-[1.02fr_0.98fr] lg:grid-rows-1 lg:items-center lg:gap-8 lg:pt-[68px] lg:pb-10">
        {/* ART — first on phones, right on desktop */}
        <motion.div style={{ y: artY, opacity: fade }} className="relative order-1 mx-auto w-full max-w-[520px] lg:order-2 lg:max-w-none" aria-hidden="true">
          <div className="relative aspect-[5/4] w-full xs:aspect-[4/3] lg:aspect-square">
            <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-0">
              {/* Path */}
              <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
                <motion.path
                  d={PATH}
                  stroke="rgba(143,192,255,0.38)"
                  strokeWidth="2"
                  strokeDasharray="3 9"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: t(0.7), duration: d(1.15), ease: EASE }}
                />
              </svg>

              {/* Footprints — one appears alone, then the path forms */}
              {PRINTS.map((p, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: `${p.x / 4}%`, top: `${p.y / 4}%`, width: `${p.s}%`, translate: "-50% -50%", rotate: p.r }}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i === 0 ? t(0.25) : t(0.78 + (i - 1) * 0.16), duration: d(i === 0 ? 0.7 : 0.45), ease: EASE_OUT_EXPO }}
                >
                  <span className="anim-pulse-ring absolute inset-0 rounded-full bg-blue-light/20" style={{ animationDelay: `${i * 0.3}s`, display: i === 0 ? "block" : "none" }} />
                  <Footprint className="relative w-full fill-blue-light/80 drop-shadow-[0_0_14px_rgba(143,192,255,0.65)]" />
                </motion.div>
              ))}

              {/* Stage light under Riko */}
              <motion.div
                className="absolute left-[46%] top-[58%] h-[10%] w-[52%] rounded-full bg-[radial-gradient(ellipse,rgba(143,192,255,0.35),transparent_70%)] blur-md"
                initial={{ opacity: 0, scaleX: 0.4 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: t(1.6), duration: d(1), ease: EASE_OUT_EXPO }}
              />
              {/* Riko rises at the end of the path */}
              <motion.div
                className="absolute left-[38%] top-[2%] w-[60%]"
                initial={{ opacity: 0, y: 70, scale: 0.86, clipPath: "inset(100% 0 0 0)" }}
                animate={{ opacity: 1, y: 0, scale: 1, clipPath: "inset(-10% 0 0 0)" }}
                transition={{ delay: t(1.55), duration: d(1), ease: EASE_OUT_EXPO }}
              >
                <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.38),transparent_64%)] blur-2xl" />
                <div className={reduced ? "" : "anim-bob"}>
                  <Riko animated={!reduced} className="relative w-full drop-shadow-[0_34px_44px_rgba(0,0,0,0.55)]" />
                </div>
              </motion.div>

              {/* Floating educational elements */}
              {FLOATERS.map((f) => (
                <motion.span
                  key={f.text}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: t(2.2 + f.d * 0.3), duration: d(0.6), ease: EASE_OUT_EXPO }}
                  className={`glass absolute rounded-2xl px-3.5 py-2 font-display text-[clamp(0.7rem,2vw,0.95rem)] font-semibold text-white/90 ${reduced ? "" : "anim-float-slow"}`}
                  style={{ left: f.x, top: f.y, ["--r" as string]: `${f.r}deg`, animationDelay: `${f.d}s`, rotate: `${f.r}deg` }}
                >
                  {f.text}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>

        {/* COPY */}
        <motion.div style={{ y: copyY }} className="relative z-10 order-2 lg:order-1">
          <h1 id="hero-title" className="text-white">
            <span className="headline-xl block whitespace-nowrap text-[clamp(4.4rem,21vw,9rem)] lg:text-[clamp(6rem,10.4vw,9.8rem)]">
              {LETTERS.map((l, i) => (
                <span key={l} className="clip-y">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "112%" }}
                    animate={{ y: "0%" }}
                    transition={{ delay: t(2.05 + i * 0.075), duration: d(0.85), ease: EASE_OUT_EXPO }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </span>
            <motion.span
              className="mt-1 block font-display text-[clamp(0.95rem,3.6vw,1.65rem)] font-semibold uppercase text-blue-light"
              initial={{ opacity: 0, letterSpacing: "0.6em", y: 8 }}
              animate={{ opacity: 1, letterSpacing: "0.3em", y: 0 }}
              transition={{ delay: t(2.5), duration: d(0.9), ease: EASE_OUT_EXPO }}
            >
              School Kids
            </motion.span>
            <motion.span
              className="mt-6 block max-w-[20ch] text-pretty font-sans text-[clamp(1.2rem,4.6vw,1.9rem)] font-medium leading-snug text-white/88"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: t(2.8), duration: d(0.7), ease: EASE_OUT_EXPO }}
            >
              {FACTS.ageFrom}–{FACTS.ageTo} yoshdagi bolalar uchun ingliz tili
            </motion.span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: t(3.05), duration: d(0.7), ease: EASE_OUT_EXPO }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href={CTA.href} size="lg" className="w-full sm:w-auto">
              {CTA.full}
              <Icon name="arrow" className="size-5" />
            </Button>
            <Link href="#kitoblar" className="inline-flex h-14 items-center justify-center gap-2 rounded-full px-5 font-bold text-white/75 transition-colors hover:text-white">
              {FACTS.books} kitobni ko‘rish
              <Icon name="arrowDown" className="size-4" />
            </Link>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: t(3.3), duration: d(0.8) }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.85rem] font-semibold text-white/55"
            aria-label="Dastur haqida qisqacha"
          >
            <li className="inline-flex items-center gap-2"><Footprint className="size-3 fill-green" />{FACTS.books} kitob</li>
            <li className="inline-flex items-center gap-2"><Footprint className="size-3 fill-blue-light" />{FACTS.years} yil · {FACTS.lessons} dars</li>
            <li className="inline-flex items-center gap-2"><Footprint className="size-3 fill-green" />{FACTS.lessonMinutes} daqiqalik darslar</li>
          </motion.ul>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.a
        href="#yol"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: t(3.7), duration: d(0.8) }}
        className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[0.68rem] font-bold uppercase tracking-[0.24em] text-white/45 transition-colors hover:text-white lg:flex"
        aria-label={`Pastga — ${SITE.shortName} yo‘li`}
      >
        Qadam tashlang
        <span className="relative block h-9 w-px overflow-hidden bg-white/15">
          <motion.span
            className="absolute inset-x-0 top-0 h-3 bg-green"
            animate={reduced ? undefined : { y: [0, 36] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </span>
      </motion.a>
    </section>
  );
}

export type { MotionValue };
