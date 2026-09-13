"use client";

import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Riko } from "@/components/brand/Riko";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CTA } from "@/content/nav";
import { CONTACT, FACTS, SITE, telHref } from "@/content/site";
import { EASE, usePrefersReducedMotion } from "@/lib/motion";

const WORDS = ["7–12", "yoshdagi", "bolalar", "uchun"];

/** Footprints walk in from bottom-left toward Riko. Positions in % of the hero art box. */
const PRINTS = [
  { x: 2, y: 92, r: 18, s: 0.55 },
  { x: 14, y: 80, r: 10, s: 0.62 },
  { x: 24, y: 88, r: 24, s: 0.68 },
  { x: 36, y: 74, r: 8, s: 0.76 },
  { x: 46, y: 84, r: 20, s: 0.84 },
];

const FLOATERS = [
  { text: "Hello!", x: "6%", y: "12%", tone: "bg-sun text-ink", r: -6, d: 0 },
  { text: "A B C", x: "70%", y: "6%", tone: "bg-sky-light text-sky-deep", r: 5, d: 1.2 },
  { text: "Riko!", x: "82%", y: "58%", tone: "bg-coral-light text-coral-deep", r: 8, d: 2.1 },
  { text: "I can read", x: "0%", y: "48%", tone: "bg-green-light text-green-deep", r: -4, d: 0.7 },
];

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const artY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 90]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : 40]);
  const blobY = useTransform(scrollYProgress, [0, 1], [0, reduced ? 0 : -60]);

  return (
    <section ref={ref} id="hero" className="relative isolate overflow-hidden pt-[68px]" aria-labelledby="hero-title">
      {/* animated background shapes */}
      <motion.div style={{ y: blobY }} aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="anim-gradient absolute -left-[20%] -top-[30%] h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle_at_30%_30%,#dcf5e6,transparent_60%)] opacity-90" />
        <div className="absolute -right-[15%] top-[10%] h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle_at_50%_50%,#fff1c2,transparent_62%)]" />
        <div className="absolute bottom-[-10%] left-[30%] h-[40vmin] w-[40vmin] rounded-full bg-[radial-gradient(circle_at_50%_50%,#dcf2fb,transparent_62%)]" />
        <div className="bg-footprints absolute inset-0 opacity-60" />
      </motion.div>

      <div className="container-x grid min-h-[calc(100svh-68px)] items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:py-6">
        {/* Copy */}
        <motion.div style={{ y: textY }} className="relative z-10 max-w-2xl pt-4 lg:pt-0">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="eyebrow"
          >
            <Footprint className="size-3.5 fill-current" />
            {SITE.name} · {FACTS.ageFrom}–{FACTS.ageTo} yosh
          </motion.p>

          <h1 id="hero-title" className="headline mt-5 text-[clamp(2.6rem,9.5vw,5.4rem)] text-ink">
            <span className="sr-only">7–12 yoshdagi bolalar uchun ingliz tili</span>
            <span aria-hidden="true" className="block">
              {WORDS.map((w, i) => (
                <motion.span
                  key={w}
                  initial={{ opacity: 0, y: reduced ? 0 : "0.6em", rotate: reduced ? 0 : 2 }}
                  animate={{ opacity: 1, y: 0, rotate: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.09, ease: EASE }}
                  className={`mr-[0.22em] inline-block ${i === 0 ? "text-green" : ""}`}
                >
                  {w}
                </motion.span>
              ))}
              <motion.span
                initial={{ opacity: 0, y: reduced ? 0 : "0.6em" }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
                className="relative inline-block"
              >
                ingliz tili
                <motion.svg
                  viewBox="0 0 300 24"
                  className="absolute -bottom-2 left-0 w-full text-sun"
                  fill="none"
                  aria-hidden="true"
                >
                  <motion.path
                    d="M4 16 C 60 6, 140 4, 296 14"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.9, delay: 0.9, ease: EASE }}
                  />
                </motion.svg>
              </motion.span>
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7, ease: EASE }}
            className="mt-6 max-w-xl text-pretty text-[1.1rem] leading-relaxed text-ink-soft sm:text-xl"
          >
            Riko dinozavr bilan <strong className="font-bold text-ink">4 kitob, 1 yil, 156 dars</strong> — birinchi so‘zlardan erkin
            ingliz tiliga qadam-baqadam. Har dars 90 daqiqa: hikoya, o‘yin va harakat bilan.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85, ease: EASE }}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button href={CTA.href} size="lg" className="w-full sm:w-auto">
              {CTA.full}
              <Icon name="arrow" className="size-5" />
            </Button>
            <Button href="#kitoblar" variant="secondary" size="lg" className="w-full sm:w-auto">
              Kitoblarni ko‘rish
            </Button>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1.05 }}
            className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-[0.92rem] font-semibold text-ink-soft"
            aria-label="Asosiy faktlar"
          >
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-green" />{FACTS.students} o‘quvchi</li>
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-sun" />{FACTS.activeGroups} faol guruh</li>
            <li className="inline-flex items-center gap-2"><span className="size-2 rounded-full bg-coral" />{FACTS.lessonMinutes} daqiqalik darslar</li>
            {CONTACT.phone && (
              <li>
                <a href={telHref(CONTACT.phone)} className="inline-flex items-center gap-2 text-ink underline-offset-4 hover:underline">
                  <Icon name="phone" className="size-4 text-green" /> {CONTACT.phone}
                </a>
              </li>
            )}
          </motion.ul>
        </motion.div>

        {/* Art */}
        <motion.div style={{ y: artY }} className="relative mx-auto w-full max-w-[560px] lg:max-w-none" aria-hidden="true">
          <div className="relative aspect-square w-full">
            {/* stage */}
            <div className="absolute inset-[6%] rounded-[44%_56%_52%_48%/48%_44%_56%_52%] bg-[linear-gradient(160deg,#dcf5e6,#fff1c2_60%,#ffe3d8)] shadow-[inset_0_-30px_60px_-30px_rgba(20,35,43,0.12)]" />
            <div className="anim-spin-slow absolute inset-[2%] rounded-full border-2 border-dashed border-ink/10" />

            {/* footprint trail */}
            {PRINTS.map((p, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.16, duration: 0.5, ease: EASE }}
                className="absolute"
                style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.s * 14}%`, transform: `rotate(${p.r}deg)` }}
              >
                <Footprint className="w-full fill-ink/20" />
              </motion.div>
            ))}

            {/* Riko */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.9, duration: 0.9, ease: EASE }}
              className="absolute inset-x-[8%] bottom-[4%] top-[6%]"
            >
              <div className={reduced ? "" : "anim-bob"}>
                <Riko animated={!reduced} className="h-full w-full drop-shadow-[0_24px_30px_rgba(20,35,43,0.22)]" />
              </div>
            </motion.div>

            {/* floating word cards */}
            {FLOATERS.map((f) => (
              <motion.span
                key={f.text}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + f.d * 0.25, duration: 0.5, ease: EASE }}
                className={`absolute ${reduced ? "" : "anim-float"} rounded-2xl px-3.5 py-2 font-display text-[clamp(0.85rem,2.2vw,1.1rem)] font-semibold shadow-[0_12px_28px_-14px_rgba(20,35,43,0.4)] ${f.tone}`}
                style={{ left: f.x, top: f.y, ["--r" as string]: `${f.r}deg`, animationDelay: `${f.d}s`, transform: `rotate(${f.r}deg)` }}
              >
                {f.text}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* scroll cue */}
      <Link
        href="#kurs"
        className="absolute bottom-4 left-1/2 hidden -translate-x-1/2 items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-ink-mute lg:inline-flex"
        aria-label="Pastga — kurs haqida"
      >
        Qadam tashlang <Icon name="arrowDown" className="size-4 animate-bounce" />
      </Link>
    </section>
  );
}
