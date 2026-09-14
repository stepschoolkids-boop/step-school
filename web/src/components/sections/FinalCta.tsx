import { Footprint } from "@/components/brand/Footprint";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { CONTACT, telHref, telegramHref } from "@/content/site";
import { TrialForm } from "./TrialForm";

/** Final conversion scene: one big statement, the form, and the verified contacts. */
export function FinalCta() {
  return (
    <section id="sinov-darsi" className="relative isolate scroll-mt-16 overflow-hidden bg-navy-950 py-20 sm:py-28 lg:py-32" aria-labelledby="cta-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="anim-breathe absolute left-1/2 top-0 h-[90vmin] w-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.22),transparent_60%)]" />
        <div className="absolute -right-[20%] bottom-0 h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(61,139,255,0.2),transparent_60%)]" />
        <Footprint className="absolute -left-10 bottom-10 w-72 -rotate-12 fill-white/[0.03]" />
      </div>

      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-16">
        <div>
          <Reveal>
            <p className="eyebrow">
              <Footprint className="size-3 fill-current" />
              Bepul sinov darsi
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="cta-title" className="headline-xl mt-5 text-balance text-[clamp(2.6rem,8vw,5.6rem)] text-white">
              Birinchi qadam <span className="text-green">shu yerdan</span> boshlanadi.
            </h2>
          </Reveal>
          <Reveal delay={0.12}>
            <p className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-white/65">
              Ariza qoldiring — administrator farzandingizga mos guruh va sinov darsi vaqtini kelishib oladi. Hech qanday majburiyat yo‘q.
            </p>
          </Reveal>

          <Reveal delay={0.18} id="aloqa" className="mt-9 scroll-mt-24">
            <p className="text-[0.66rem] font-extrabold uppercase tracking-[0.22em] text-white/45">Aloqa</p>
            <ul className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              {CONTACT.phone && (
                <li>
                  <a href={telHref(CONTACT.phone)} className="glass inline-flex h-12 items-center gap-2.5 rounded-full px-5 font-bold text-white transition-colors hover:bg-white/10">
                    <Icon name="phone" className="size-4 text-green" /> {CONTACT.phone}
                  </a>
                </li>
              )}
              {CONTACT.telegramUsername && (
                <li>
                  <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="glass inline-flex h-12 items-center gap-2.5 rounded-full px-5 font-bold text-white transition-colors hover:bg-white/10">
                    <Icon name="telegram" className="size-4 text-blue-light" /> @{CONTACT.telegramUsername}
                  </a>
                </li>
              )}
              {CONTACT.telegramSecondary && (
                <li>
                  <a href={telegramHref(CONTACT.telegramSecondary)} target="_blank" rel="noopener noreferrer" className="glass inline-flex h-12 items-center gap-2.5 rounded-full px-5 font-bold text-white transition-colors hover:bg-white/10">
                    <Icon name="telegram" className="size-4 text-blue-light" /> @{CONTACT.telegramSecondary}
                  </a>
                </li>
              )}
              {CONTACT.instagramUrl && (
                <li>
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="glass inline-flex h-12 items-center gap-2.5 rounded-full px-5 font-bold text-white transition-colors hover:bg-white/10">
                    <Icon name="instagram" className="size-4 text-[#ff8f74]" /> @{CONTACT.instagramUsername ?? "stepschool.kids"}
                  </a>
                </li>
              )}
            </ul>
            {CONTACT.address ? (
              <p className="mt-4 flex items-start gap-2 text-white/65">
                <Icon name="pin" className="mt-0.5 size-4 shrink-0 text-green" /> {CONTACT.address}
                {CONTACT.workingHours && <span className="text-white/45"> · {CONTACT.workingHours}</span>}
              </p>
            ) : (
              <p className="mt-4 text-sm text-white/45">Manzil va yo‘nalishni administrator Telegram orqali yuboradi.</p>
            )}
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <TrialForm />
        </Reveal>
      </div>
    </section>
  );
}
