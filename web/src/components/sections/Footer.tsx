import Link from "next/link";
import { Footprint } from "@/components/brand/Footprint";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/content/nav";
import { CONTACT, SITE, telHref, telegramHref } from "@/content/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-cream-2">
      <Footprint className="absolute -bottom-10 -right-6 w-56 rotate-[-16deg] fill-ink/[0.05]" />
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-pretty text-ink-soft">{SITE.tagline}. Riko bilan 4 kitob, 1 yil, 156 dars.</p>
            <p className="mt-4 font-display text-lg font-semibold text-green-deep">{SITE.motto}</p>
          </div>
          <nav aria-label="Sayt bo‘limlari">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink-mute">Bo‘limlar</p>
            <ul className="mt-3 grid gap-2">
              {NAV_ITEMS.map((i) => (
                <li key={i.href}>
                  <Link href={i.href} className="font-semibold text-ink-soft hover:text-ink">
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink-mute">Aloqa</p>
            <ul className="mt-3 grid gap-2.5">
              {CONTACT.phone && (
                <li>
                  <a href={telHref(CONTACT.phone)} className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink">
                    <Icon name="phone" className="size-4 text-green" /> {CONTACT.phone}
                  </a>
                </li>
              )}
              {CONTACT.telegramUsername && (
                <li>
                  <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink">
                    <Icon name="telegram" className="size-4 text-sky-deep" /> @{CONTACT.telegramUsername}
                  </a>
                </li>
              )}
              {CONTACT.instagramUrl && (
                <li>
                  <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 font-semibold text-ink-soft hover:text-ink">
                    <Icon name="instagram" className="size-4 text-coral" /> Instagram
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 border-t border-ink/10 pt-6 text-sm text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {SITE.name}. Barcha huquqlar himoyalangan.</p>
          <p>{SITE.domain}</p>
        </div>
      </div>
    </footer>
  );
}
