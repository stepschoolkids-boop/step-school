import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTA } from "@/content/nav";
import { GROUPS, PRICE } from "@/content/schedule";
import { CONTACT, FACTS, telHref, telegramHref } from "@/content/site";

const VERIFIED = [
  { icon: "age" as const, k: "Yosh", v: `${FACTS.ageFrom}–${FACTS.ageTo} yosh` },
  { icon: "timer" as const, k: "Dars davomiyligi", v: `${FACTS.lessonMinutes} daqiqa` },
  { icon: "books" as const, k: "Dastur", v: `${FACTS.books} kitob · ${FACTS.lessons} dars · ${FACTS.years} yil` },
  { icon: "spark" as const, k: "Qabul", v: `${FACTS.openGroupCapacity} ta yangi guruhga joy bor` },
];

export function Schedule() {
  const hasGroups = GROUPS.length > 0;
  return (
    <section id="narxlar" className="relative py-20 sm:py-28" aria-labelledby="schedule-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Jadval va narxlar"
          id="schedule-title"
          title={
            <>
              Ochiq shartlar. <span className="text-green">Yashirin to‘lovlar yo‘q.</span>
            </>
          }
          text="Guruh, kunlar, vaqt va narx — barchasini sinov darsigacha aniq bilib olasiz."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Groups */}
          <Reveal className="card overflow-hidden">
            <div className="border-b border-ink/10 px-6 py-5 sm:px-8">
              <h3 className="font-display text-xl font-semibold">Guruhlar</h3>
            </div>
            {hasGroups ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-mute">
                    <tr>
                      <th className="px-6 py-3 sm:px-8">Yosh</th>
                      <th className="px-4 py-3">Guruh</th>
                      <th className="px-4 py-3">Kunlar</th>
                      <th className="px-4 py-3">Vaqt</th>
                      <th className="px-6 py-3 text-right sm:px-8">Joy</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink/8">
                    {GROUPS.map((g) => (
                      <tr key={`${g.group}-${g.time}`}>
                        <td className="px-6 py-4 font-semibold sm:px-8">{g.age}</td>
                        <td className="px-4 py-4">{g.group}</td>
                        <td className="px-4 py-4">{g.days}</td>
                        <td className="px-4 py-4">{g.time}</td>
                        <td className="px-6 py-4 text-right sm:px-8">{g.placesLeft !== undefined ? `${g.placesLeft} joy` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 sm:p-8">
                <ul className="grid gap-4 sm:grid-cols-2">
                  {VERIFIED.map((f) => (
                    <li key={f.k} className="flex items-start gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-green-light text-green-deep">
                        <Icon name={f.icon} className="size-5" />
                      </span>
                      <div>
                        <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink-mute">{f.k}</p>
                        <p className="font-display text-lg font-semibold leading-tight">{f.v}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="mt-6 rounded-2xl bg-cream-2 p-4 text-sm leading-relaxed text-ink-soft">
                  Guruhlar jadvali yoshga va darajaga qarab tuziladi. Farzandingizga mos guruh kunlari va vaqtini administrator bilan
                  aniqlashtirasiz.
                </p>
              </div>
            )}
          </Reveal>

          {/* Price */}
          <Reveal delay={0.1} className="relative overflow-hidden rounded-[var(--radius-xl)] bg-ink p-6 text-white sm:p-8">
            <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-green/30 blur-3xl" aria-hidden="true" />
            <h3 className="font-display text-xl font-semibold">Narx</h3>
            {PRICE ? (
              <>
                <p className="headline mt-4 text-5xl text-sun">{PRICE.monthly}</p>
                <p className="text-white/70">{PRICE.monthlyNote}</p>
                <ul className="mt-6 grid gap-2.5">
                  {PRICE.included.map((x) => (
                    <li key={x} className="flex items-center gap-2.5 text-white/85">
                      <Icon name="check" className="size-5 text-green" /> {x}
                    </li>
                  ))}
                </ul>
                {PRICE.bookCost && <p className="mt-5 text-sm text-white/70">{PRICE.bookCost}</p>}
                {PRICE.payment && <p className="mt-1 text-sm text-white/70">{PRICE.payment}</p>}
              </>
            ) : (
              <>
                <p className="headline mt-4 text-[clamp(1.8rem,4vw,2.6rem)] leading-tight">Narxni so‘rov bo‘yicha aytamiz</p>
                <p className="mt-3 text-white/70">
                  Oylik to‘lov, kitob narxi va to‘lov usullari haqida to‘liq ma‘lumotni bir qo‘ng‘iroqda olasiz. Sinov darsi — bepul.
                </p>
                <ul className="mt-6 grid gap-2.5 text-white/85">
                  <li className="flex items-center gap-2.5"><Icon name="check" className="size-5 text-green" /> Oylik to‘lov</li>
                  <li className="flex items-center gap-2.5"><Icon name="check" className="size-5 text-green" /> Kitoblar narxi</li>
                  <li className="flex items-center gap-2.5"><Icon name="check" className="size-5 text-green" /> To‘lov usullari</li>
                </ul>
              </>
            )}
            <div className="mt-8 flex flex-col gap-3">
              <Button href={CTA.href} size="lg" className="w-full">
                {CTA.full}
              </Button>
              <div className="flex flex-wrap gap-2 text-sm">
                {CONTACT.phone && (
                  <a href={telHref(CONTACT.phone)} className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold hover:bg-white/10">
                    <Icon name="phone" className="size-4 text-green" /> {CONTACT.phone}
                  </a>
                )}
                {CONTACT.telegramUsername && (
                  <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-bold hover:bg-white/10">
                    <Icon name="telegram" className="size-4 text-sky" /> Telegram
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
