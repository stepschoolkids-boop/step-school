import Image from "next/image";
import { Footprint } from "@/components/brand/Footprint";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CONTACT, telHref, telegramHref } from "@/content/site";

type Row = { icon: IconName; label: string; value: string; href?: string; external?: boolean };

export function Contact() {
  // Only rows with verified data are rendered.
  const rows: Row[] = [
    CONTACT.phone && { icon: "phone", label: "Telefon", value: CONTACT.phone, href: telHref(CONTACT.phone) },
    CONTACT.telegramUsername && {
      icon: "telegram",
      label: "Telegram",
      value: `@${CONTACT.telegramUsername}`,
      href: telegramHref(CONTACT.telegramUsername),
      external: true,
    },
    CONTACT.instagramUrl && { icon: "instagram", label: "Instagram", value: CONTACT.instagramUrl.replace(/^https?:\/\/(www\.)?/, ""), href: CONTACT.instagramUrl, external: true },
    CONTACT.address && { icon: "pin", label: "Manzil", value: CONTACT.address },
    CONTACT.workingHours && { icon: "clock", label: "Ish vaqti", value: CONTACT.workingHours },
  ].filter(Boolean) as Row[];

  return (
    <section id="aloqa" className="relative py-20 sm:py-28" aria-labelledby="contact-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Aloqa"
          id="contact-title"
          title={
            <>
              Savolingiz bormi? <span className="text-green">Yozing yoki qo‘ng‘iroq qiling</span>
            </>
          }
          text="Administratorimiz guruhlar, jadval va narxlar haqida barcha savollaringizga javob beradi."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal className="card p-7 sm:p-9">
            <ul className="grid gap-5">
              {rows.map((r) => (
                <li key={r.label} className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-green-light text-green-deep">
                    <Icon name={r.icon} className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-mute">{r.label}</p>
                    {r.href ? (
                      <a
                        href={r.href}
                        target={r.external ? "_blank" : undefined}
                        rel={r.external ? "noopener noreferrer" : undefined}
                        className="font-display text-xl font-semibold text-ink underline-offset-4 hover:underline"
                      >
                        {r.value}
                      </a>
                    ) : (
                      <p className="font-display text-xl font-semibold text-ink">{r.value}</p>
                    )}
                  </div>
                </li>
              ))}
              {!CONTACT.address && (
                <li className="flex items-start gap-4">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-sun-light text-sun-deep">
                    <Icon name="pin" className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-mute">Manzil</p>
                    <p className="font-display text-xl font-semibold text-ink">Yo‘nalishni administratordan so‘rang</p>
                    <p className="mt-1 text-sm text-ink-soft">Telegram yoki qo‘ng‘iroq orqali aniq manzil va mo‘ljalni yuboramiz.</p>
                  </div>
                </li>
              )}
            </ul>
          </Reveal>

          <Reveal delay={0.1} className="relative min-h-[320px] overflow-hidden rounded-[var(--radius-xl)] border border-ink/10 bg-cream-2">
            {CONTACT.mapEmbedUrl ? (
              <iframe
                src={CONTACT.mapEmbedUrl}
                title="STEP SCHOOL KIDS xaritada"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="absolute inset-0 h-full w-full border-0"
                allowFullScreen
              />
            ) : CONTACT.entrancePhoto ? (
              <Image src={CONTACT.entrancePhoto} alt="STEP SCHOOL KIDS kirish qismi" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
            ) : (
              /* No verified map/photo yet — brand illustration instead of a fake pin. */
              <div className="absolute inset-0 grid place-items-center p-8 text-center">
                <div className="bg-footprints absolute inset-0 opacity-80" aria-hidden="true" />
                <div className="relative">
                  <span className="mx-auto grid size-20 place-items-center rounded-[28px] bg-ink text-sun shadow-[var(--shadow-soft)]">
                    <Footprint className="size-11 fill-current" />
                  </span>
                  <p className="headline mt-6 text-2xl">Xarita tez orada</p>
                  <p className="mt-2 max-w-xs text-sm text-ink-soft">Kirish qismi surati va xaritani shu yerga qo‘yamiz.</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
