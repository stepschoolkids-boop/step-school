import { Riko } from "@/components/brand/Riko";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { LESSON_STAGES } from "@/content/lesson";
import { FACTS } from "@/content/site";

export function LessonFlow() {
  return (
    <section id="darslar" className="relative isolate overflow-hidden bg-green-deep py-20 text-white sm:py-28" aria-labelledby="lesson-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-[70vmin] w-[70vmin] rounded-full bg-green/60 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[60vmin] w-[60vmin] rounded-full bg-sun/20 blur-3xl" />
      </div>

      <div className="container-x">
        <div className="grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <SectionHeading
            tone="dark"
            eyebrow="Dars qanday o‘tadi"
            id="lesson-title"
            title={
              <>
                {FACTS.lessonMinutes} daqiqa — bola uchun <span className="text-sun">uzoq tuyulmaydi</span>
              </>
            }
            text="Kids darsi 90 daqiqa davom etadi, lekin bola o‘tirib qolmaydi. Dars bo‘limlarga bo‘lingan, o‘rtasida esa — harakatli tanaffus."
          />
          <Reveal delay={0.1}>
            <div className="relative grid size-40 place-items-center rounded-full border-2 border-dashed border-white/30 sm:size-48">
              <Riko className="pointer-events-none absolute -left-24 bottom-0 hidden w-28 lg:block" />
              <div className="anim-spin-slow absolute inset-0 rounded-full border-4 border-transparent border-t-sun border-r-sun/40" aria-hidden="true" />
              <div className="text-center">
                <p className="headline text-6xl">{FACTS.lessonMinutes}</p>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-white/70">daqiqa</p>
              </div>
            </div>
          </Reveal>
        </div>

        <ol className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-label="Dars bosqichlari">
          {LESSON_STAGES.map((s, i) => (
            <Reveal
              as="li"
              key={s.title}
              delay={(i % 4) * 0.07}
              className={`relative rounded-[var(--radius-xl)] p-6 ${
                s.movement
                  ? "bg-coral text-white shadow-[0_24px_50px_-24px_rgba(255,106,61,0.9)]"
                  : "border border-white/12 bg-white/[0.06]"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className={`grid size-11 place-items-center rounded-xl ${s.movement ? "bg-white/20" : "bg-white/10"}`}>
                  <Icon name={s.icon} className="size-5" />
                </span>
                <span className="font-display text-sm font-semibold text-white/50">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-display text-xl font-semibold leading-tight">{s.title}</h3>
              <p className={`mt-2 text-sm leading-relaxed ${s.movement ? "text-white/90" : "text-white/70"}`}>{s.text}</p>
              {s.movement && (
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.16em]">
                  <Icon name="spark" className="size-3.5" /> Kids darslariga xos
                </span>
              )}
            </Reveal>
          ))}
        </ol>
        <p className="mt-6 text-sm text-white/60">* Bosqichlar tartibi va davomiyligi guruh va mavzuga qarab moslashtiriladi. Umumiy dars vaqti — {FACTS.lessonMinutes} daqiqa.</p>
      </div>
    </section>
  );
}
