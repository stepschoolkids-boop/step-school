"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Riko } from "@/components/brand/Riko";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LESSON_STAGES } from "@/content/lesson";
import { FACTS } from "@/content/site";
import { EASE_OUT_EXPO, usePrefersReducedMotion } from "@/lib/motion";

/**
 * 90-minute lesson as an interactive timeline (tabs). Auto-advances while in view,
 * pauses on interaction. The MOVE stage is highlighted as the Kids-specific feature.
 */
export function LessonTimeline() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const reduced = usePrefersReducedMotion();
  const stage = LESSON_STAGES[active];

  useEffect(() => {
    if (!inView || paused || reduced) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % LESSON_STAGES.length), 2600);
    return () => window.clearInterval(id);
  }, [inView, paused, reduced]);

  const select = (i: number) => {
    setActive(i);
    setPaused(true);
  };

  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "ArrowRight") select((i + 1) % LESSON_STAGES.length);
    if (e.key === "ArrowLeft") select((i - 1 + LESSON_STAGES.length) % LESSON_STAGES.length);
  };

  return (
    <section id="darslar" className="relative overflow-hidden bg-navy-950 py-20 sm:py-28 lg:py-32" aria-labelledby="lesson-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute right-[-20%] top-[-10%] h-[80vmin] w-[80vmin] rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.16),transparent_60%)]" />
        <div className="bg-footprints absolute inset-0" />
      </div>

      <div className="container-x relative">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            eyebrow="Dars qanday o‘tadi"
            id="lesson-title"
            title={
              <>
                {FACTS.lessonMinutes} daqiqa — <span className="text-green">harakat bilan</span>
              </>
            }
            text="Bola o‘tirib qolmaydi: dars bosqichlarga bo‘lingan, o‘rtasida harakatli tanaffus."
          />
          <Reveal delay={0.1}>
            <div className="relative grid size-36 place-items-center rounded-full border border-white/15 sm:size-44">
              <div className="anim-spin-slow absolute inset-[-2px] rounded-full border-[3px] border-transparent border-t-green border-r-green/30" aria-hidden="true" />
              <div className="text-center">
                <p className="headline text-5xl text-white">{FACTS.lessonMinutes}</p>
                <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-white/50">daqiqa</p>
              </div>
            </div>
          </Reveal>
        </div>

        <div ref={ref} className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:gap-10">
          {/* tabs */}
          <div role="tablist" aria-label="Dars bosqichlari" className="grid grid-cols-2 content-start gap-2 sm:grid-cols-3">
            {LESSON_STAGES.map((s, i) => {
              const on = i === active;
              return (
                <button
                  key={s.key}
                  role="tab"
                  id={`lesson-tab-${i}`}
                  aria-selected={on}
                  aria-controls="lesson-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKey(e, i)}
                  onMouseEnter={() => setPaused(true)}
                  className={`group relative flex min-h-[92px] flex-col justify-between rounded-2xl border p-4 text-left transition-colors duration-300 ${
                    on
                      ? s.movement
                        ? "border-green bg-green text-navy-950"
                        : "border-white/30 bg-white/10 text-white"
                      : s.movement
                        ? "border-green/40 bg-green/10 text-white hover:bg-green/15"
                        : "border-white/10 bg-white/[0.04] text-white/75 hover:bg-white/[0.07]"
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span className={`font-display text-[0.6rem] font-bold uppercase tracking-[0.2em] ${on ? "opacity-80" : "opacity-50"}`}>{s.key}</span>
                    <span className={`text-[0.62rem] font-bold ${on ? "opacity-80" : "opacity-40"}`}>0{i + 1}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Icon name={s.icon} className="size-4.5" />
                    <span className="font-semibold">{s.title}</span>
                  </span>
                  {s.movement && !on && <span className="anim-pulse-ring absolute right-3 top-3 size-2 rounded-full bg-green" aria-hidden="true" />}
                  {on && <span className="absolute inset-x-4 bottom-0 h-0.5 rounded-full bg-current opacity-60" aria-hidden="true" />}
                </button>
              );
            })}
          </div>

          {/* panel */}
          <div id="lesson-panel" role="tabpanel" aria-labelledby={`lesson-tab-${active}`} className="glass relative min-h-[260px] overflow-hidden rounded-[var(--radius-2xl)] p-7 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={stage.key}
                initial={{ opacity: 0, y: reduced ? 0 : 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -10 }}
                transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              >
                <p className={`font-display text-[0.65rem] font-bold uppercase tracking-[0.24em] ${stage.movement ? "text-green" : "text-blue-light"}`}>
                  {stage.key} · 0{active + 1} / 0{LESSON_STAGES.length}
                </p>
                <h3 className="headline mt-3 text-[clamp(1.7rem,4vw,2.6rem)] text-white">{stage.title}</h3>
                <p className="mt-3 max-w-md text-pretty text-lg leading-relaxed text-white/70">{stage.text}</p>
                {stage.movement && (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-green/15 px-3 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-green">
                    <Icon name="spark" className="size-3.5" /> Kids darslariga xos
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
            <Riko variant="speak" decorative sizes="160px" className="pointer-events-none absolute -bottom-4 -right-2 w-28 sm:w-36" />
            {/* progress segments */}
            <div className="absolute inset-x-7 top-4 flex gap-1 sm:inset-x-9" aria-hidden="true">
              {LESSON_STAGES.map((s, i) => (
                <span key={s.key} className={`h-0.5 flex-1 rounded-full transition-colors duration-500 ${i <= active ? "bg-green" : "bg-white/15"}`} />
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-xs text-white/40">Bosqichlar tartibi guruh va mavzuga qarab moslashadi. Umumiy dars vaqti — {FACTS.lessonMinutes} daqiqa.</p>
      </div>
    </section>
  );
}
