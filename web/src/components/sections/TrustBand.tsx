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

const TERMS = [
  { icon: "age" as const, v: `${FACTS.ageFrom}–${FACTS.ageTo} yosh` },
  { icon: "timer" as const, v: `${FACTS.lessonMinutes} daqiqa` },
  { icon: "books" as const, v: `${FACTS.books} kitob · ${FACTS.lessons} dars` },
];

/**
 * Compact trust + terms band. Verified numbers only, no testimonials, no invented
 * teachers, prices or schedules — empty data renders honest "so‘rov bo‘yicha" states.
 */
export function TrustBand() {
  return (
    <section id="narxlar" className="relative bg-navy-950 py-24 sm:py-32" aria-labelledby="trust-title">
      <div className="container-x">
        <h2 id="trust-title" className="sr-only">
          Ishonch, o‘qituvchilar, jadval va narxlar
        </h2>
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Numbers + teachers */}
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

            <div className="mt-8 border-t border-white/10 pt-7">
              <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-white/45">O‘qituvchilar</p>
              <p className="mt-3 max-w-lg text-pretty text-[1.05rem] leading-relaxed text-white/80">
                O‘qituvchilarimiz bolalar bilan ishlash xususiyatlarini hisobga olgan aniq mezonlar asosida tanlanadi. Eng yaxshi tanishuv — sinov darsida.
              </p>
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
              <Link href={CTA.href} className="mt-5 inline-flex items-center gap-2 font-bold text-green underline-offset-4 hover:underline">
                O‘qituvchi bilan sinov darsida tanishing <Icon name="arrow" className="size-4" />
              </Link>
            </div>
          </Reveal>

          {/* Terms + price */}
          <Reveal delay={0.1} className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-[linear-gradient(160deg,#0f2a5c,#0b1a3a_60%,#0a2a2c)] p-7 sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-green/25 blur-3xl" aria-hidden="true" />
            <p className="eyebrow">
              <Footprint className="size-3 fill-current" />
              Jadval va narx
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {TERMS.map((t) => (
                <li key={t.v} className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.06] px-3.5 py-2 text-sm font-semibold text-white/90">
                  <Icon name={t.icon} className="size-4 text-green" /> {t.v}
                </li>
              ))}
            </ul>

            {GROUPS.length > 0 && (
              <ul className="mt-6 divide-y divide-white/10 text-sm">
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

            {PRICE ? (
              <div className="mt-7">
                <p className="headline text-5xl text-green">{PRICE.monthly}</p>
                <p className="text-white/60">{PRICE.monthlyNote}</p>
                <ul className="mt-4 grid gap-2 text-white/85">
                  {PRICE.included.map((x) => (
                    <li key={x} className="flex items-center gap-2">
                      <Icon name="check" className="size-4 text-green" /> {x}
                    </li>
                  ))}
                </ul>
                {PRICE.bookCost && <p className="mt-4 text-sm text-white/60">{PRICE.bookCost}</p>}
                {PRICE.payment && <p className="mt-1 text-sm text-white/60">{PRICE.payment}</p>}
              </div>
            ) : (
              <div className="mt-7">
                <p className="headline text-[clamp(1.5rem,3.4vw,2.1rem)] text-white">Narx va guruh jadvali — so‘rov bo‘yicha</p>
                <p className="mt-3 text-pretty text-white/65">Farzandingiz yoshiga mos guruh, kunlar va oylik to‘lovni bir qo‘ng‘iroqda aniqlab olasiz. Sinov darsi — bepul.</p>
              </div>
            )}

            <Link href={CTA.href} className="btn-primary mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full font-bold sm:w-auto sm:px-7">
              {CTA.full} <Icon name="arrow" className="size-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
