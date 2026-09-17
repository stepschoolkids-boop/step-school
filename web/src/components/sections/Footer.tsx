import Link from "next/link";
import { Footprint } from "@/components/brand/Footprint";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { NAV_ITEMS } from "@/content/nav";
import { CONTACT, SITE, telHref, telegramHref } from "@/content/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-ink/10 bg-canvas">
      <Footprint className="pointer-events-none absolute -bottom-12 -right-8 w-64 rotate-[-16deg] fill-ink/[0.03]" aria-hidden="true" />
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-ink/50">{SITE.tagline}</p>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-green-ink/80">{SITE.motto}</p>
        </div>
        <nav aria-label="Sayt bo‘limlari">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink/60">
            {NAV_ITEMS.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-ink">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-col gap-1.5 text-sm font-semibold text-ink/60">
          {CONTACT.phone && (
            <li>
              <a href={telHref(CONTACT.phone)} className="hover:text-ink">
                {CONTACT.phone}
              </a>
            </li>
          )}
          {CONTACT.telegramUsername && (
            <li>
              <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                @{CONTACT.telegramUsername}
              </a>
            </li>
          )}
          {CONTACT.telegramSecondary && (
            <li>
              <a href={telegramHref(CONTACT.telegramSecondary)} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                @{CONTACT.telegramSecondary}
              </a>
            </li>
          )}
          {CONTACT.instagramUrl && (
            <li>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-ink">
                <Icon name="instagram" className="size-4 text-coral" /> @{CONTACT.instagramUsername ?? "stepschool.kids"}
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className="container-x flex flex-col gap-1 border-t border-ink/10 py-5 text-xs text-ink/35 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}</p>
        <p>{SITE.domain}</p>
      </div>
    </footer>
  );
}
