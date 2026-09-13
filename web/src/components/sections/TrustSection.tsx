import { Footprint } from "@/components/brand/Footprint";
import { CountUp } from "@/components/ui/CountUp";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FACTS } from "@/content/site";

/** Verified numbers only. No testimonials are shown until real ones are supplied. */
const STATS = [
  { v: FACTS.students, l: "o‘quvchi", t: "hozir bizda o‘qiyapti" },
  { v: FACTS.activeGroups, l: "faol guruh", t: "har kuni dars o‘tilmoqda" },
  { v: FACTS.openGroupCapacity, l: "yangi guruh", t: "qabul uchun joy bor" },
  { v: FACTS.lessons, l: "dars", t: "bir yillik dasturda" },
];

const REASONS = [
  { icon: "uz" as const, t: "Ingliz tili — o‘zbekcha izoh bilan", d: "Bola qoidani tushunmay qolmaydi: har qoida ostida ona tilida tushuntirish bor." },
  { icon: "parent" as const, t: "Ota-ona tekshira oladi", d: "Ingliz tilini bilmasangiz ham farzandingiz nimani o‘rganganini kitob orqali tekshirasiz." },
  { icon: "move" as const, t: "Harakatli tanaffuslar", d: "90 daqiqa davomida bola o‘tirib qolmaydi — bu Kids darslarining ajralmas qismi." },
];

export function TrustSection() {
  return (
    <section className="relative isolate overflow-hidden bg-ink py-20 text-white sm:py-28" aria-labelledby="trust-title">
      <Footprint className="pointer-events-none absolute -left-16 top-10 w-72 -rotate-12 fill-white/[0.03]" />
      <Footprint className="pointer-events-none absolute -right-10 bottom-0 w-64 rotate-[20deg] fill-white/[0.03]" />
      <div className="container-x">
        <SectionHeading
          tone="dark"
          align="center"
          eyebrow="Raqamlar"
          id="trust-title"
          title={
            <>
              Ota-onalar bizga <span className="text-sun">ishonadi</span>
            </>
          }
          text="Bu raqamlar — hozirgi holat. Biz ularni oshirib ko‘rsatmaymiz."
        />

        <dl className="mt-14 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.l} delay={i * 0.08} className="rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.05] p-6 sm:p-8">
              <dd className="headline text-[clamp(2.6rem,7vw,4.4rem)] text-sun">
                <CountUp to={s.v} />
              </dd>
              <dt className="mt-1 font-display text-lg font-semibold">{s.l}</dt>
              <p className="text-sm text-white/60">{s.t}</p>
            </Reveal>
          ))}
        </dl>

        <ul className="mt-6 grid gap-3 sm:gap-4 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <Reveal as="li" key={r.t} delay={0.2 + i * 0.08} className="flex gap-4 rounded-[var(--radius-xl)] border border-white/10 bg-white/[0.04] p-6">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green text-white">
                <Icon name={r.icon} className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold leading-tight">{r.t}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-white/70">{r.d}</p>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
