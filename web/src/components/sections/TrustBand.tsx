import Image from "next/image";
import Link from "next/link";
import { Footprint } from "@/components/brand/Footprint";
import { CountUp } from "@/components/ui/CountUp";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/content/nav";
import { GROUPS, PRICE } from "@/content/schedule";
import { FACTS } from "@/content/site";
import { TEACHERS } from "@/content/teachers";

const NUMBERS = [
  { v: FACTS.students, l: "o‘quvchi" },
  { v: FACTS.activeGroups, l: "faol guruh" },
  { v: FACTS.openGroupCapacity, l: "yangi guruhga joy" },
];

/** Copy supplied by the school (14 Sept 2026). */
const TEACHER_POINTS = [
  "Bolalar bilan ishlashni yaxshi biladi",
  "Har bir o‘quvchining darajasiga mos yondashadi",
  "Mavzularni tushunarli va qiziqarli yetkazadi",
  "Professional, do‘stona va e‘tiborli",
];

/**
 * Trust band: verified numbers + monthly price on the left, teachers on the right.
 * No testimonials, no invented names or credentials — `TEACHERS` renders only real profiles.
 */
export function TrustBand() {
  return (
    <section id="narxlar" className="relative bg-navy-950 py-20 sm:py-28 lg:py-32" aria-labelledby="trust-title">
      <div className="container-x">
        <h2 id="trust-title" className="sr-only">
          Ishonch, narx va ustozlar
        </h2>
        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          {/* Numbers + price */}
          <Reveal className="glass relative overflow-hidden rounded-[var(--radius-2xl)] p-7 sm:p-10">
            <Footprint className="pointer-events-none absolute -right-8 -top-8 w-40 rotate-12 fill-white/[0.04]" aria-hidden="true" />
            <p className="eyebrow">
              <Footprint className="size-3 fill-current" />
              Bugungi holat
            </p>
            <dl className="mt-6 grid grid-cols-3 gap-4">
              {NUMBERS.map((n) => (
                <div key={n.l}>
                  <dd className="headline text-[clamp(2.4rem,7vw,4.2rem)] text-white">
                    <CountUp to={n.v} />
                  </dd>
                  <dt className="mt-1 text-[0.8rem] font-semibold text-white/55 sm:text-sm">{n.l}</dt>
                </div>
              ))}
            </dl>

            <div id="narx" className="mt-8 scroll-mt-24 border-t border-white/10 pt-7">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-white/45">Oylik to‘lov</p>
              {PRICE ? (
                <>
                  <p className="mt-3 flex flex-wrap items-baseline gap-x-3">
                    <span className="headline whitespace-nowrap text-[clamp(1.7rem,7vw,3.4rem)] text-green">{PRICE.monthly}</span>
                    <span className="font-display text-lg font-semibold text-white/60">{PRICE.monthlyNote}</span>
                  </p>
                  {PRICE.included.length > 0 && (
                    <ul className="mt-4 grid gap-2 text-white/85">
                      {PRICE.included.map((x) => (
                        <li key={x} className="flex items-center gap-2">
                          <Icon name="check" className="size-4 text-green" /> {x}
                        </li>
                      ))}
                    </ul>
                  )}
                  {PRICE.bookCost && <p className="mt-3 text-sm text-white/60">{PRICE.bookCost}</p>}
                  {PRICE.payment && <p className="mt-1 text-sm text-white/60">{PRICE.payment}</p>}
                </>
              ) : (
                <p className="headline mt-3 text-[clamp(1.4rem,3vw,2rem)] text-white">Narx — so‘rov bo‘yicha</p>
              )}

              {GROUPS.length > 0 && (
                <ul className="mt-5 divide-y divide-white/10 text-sm">
                  {GROUPS.map((g) => (
                    <li key={`${g.group}-${g.time}`} className="flex flex-wrap justify-between gap-2 py-3">
                      <span className="font-semibold text-white">{g.group}</span>
                      <span className="text-white/65">
                        {g.age} · {g.days} · {g.time}
                        {g.placesLeft !== undefined && ` · ${g.placesLeft} joy`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-4 max-w-md text-pretty text-sm leading-relaxed text-white/55">
                Sinov darsi — bepul. Farzandingiz yoshiga mos guruh va dars kunlarini administrator bilan kelishib olasiz.
              </p>
              <Link href={CTA.href} className="btn-primary mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full font-bold sm:w-auto sm:px-7">
                {CTA.full} <Icon name="arrow" className="size-4" />
              </Link>
            </div>
          </Reveal>

          {/* Teachers */}
          <Reveal id="oqituvchilar" delay={0.1} className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[linear-gradient(160deg,#0f2a5c,#0b1a3a_60%,#0a2a2c)] p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-green/25 blur-3xl" aria-hidden="true" />
            <p className="eyebrow">
              <Footprint className="size-3 fill-current" />
              Ustozlarimiz
            </p>
            <h3 className="headline mt-4 text-balance text-[clamp(1.5rem,3.2vw,2.1rem)] text-white">Malakali ustozlar — bolangizga to‘g‘ri yondashuv</h3>
            <p className="mt-4 text-pretty leading-relaxed text-white/72">
              Ustozlarimiz malakali va tajribali. Ular bolalar bilan ishlashni yaxshi biladi, har bir o‘quvchining darajasiga mos yondashadi va
              mavzularni tushunarli tarzda yetkazadi.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {TEACHER_POINTS.map((x) => (
                <li key={x} className="flex items-start gap-2.5 text-white/88">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-green/20 text-green">
                    <Icon name="check" className="size-3" />
                  </span>
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm text-white/50">Ustozlar bolalar bilan ishlash xususiyatlarini hisobga olgan aniq mezonlar asosida tanlanadi.</p>

            {TEACHERS.length > 0 && (
              <ul className="mt-5 flex flex-wrap gap-3" aria-label="O‘qituvchilar">
                {TEACHERS.map((t) => (
                  <li key={t.name} className="flex items-center gap-3 rounded-full bg-white/[0.06] py-1.5 pl-1.5 pr-4">
                    <span className="relative size-9 overflow-hidden rounded-full bg-green/20">
                      {t.photo && <Image src={t.photo} alt="" fill sizes="36px" className="object-cover" />}
                    </span>
                    <span className="text-sm">
                      <span className="block font-semibold text-white">{t.name}</span>
                      <span className="block text-xs text-white/50">{t.role}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Link href={CTA.href} className="mt-6 inline-flex items-center gap-2 font-bold text-green underline-offset-4 hover:underline">
              Ustoz bilan sinov darsida tanishing <Icon name="arrow" className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
