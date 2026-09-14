import Link from "next/link";
import { Footprint } from "@/components/brand/Footprint";
import { Logo } from "@/components/brand/Logo";
import { NAV_ITEMS } from "@/content/nav";
import { CONTACT, SITE, telHref, telegramHref } from "@/content/site";

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-navy-950">
      <Footprint className="pointer-events-none absolute -bottom-12 -right-8 w-64 rotate-[-16deg] fill-white/[0.03]" aria-hidden="true" />
      <div className="container-x flex flex-col gap-8 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <p className="text-sm text-white/50">{SITE.tagline}</p>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-green/80">{SITE.motto}</p>
        </div>
        <nav aria-label="Sayt bo‘limlari">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/60">
            {NAV_ITEMS.map((i) => (
              <li key={i.href}>
                <Link href={i.href} className="hover:text-white">
                  {i.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <ul className="flex flex-col gap-1.5 text-sm font-semibold text-white/60">
          {CONTACT.phone && (
            <li>
              <a href={telHref(CONTACT.phone)} className="hover:text-white">
                {CONTACT.phone}
              </a>
            </li>
          )}
          {CONTACT.telegramUsername && (
            <li>
              <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                @{CONTACT.telegramUsername}
              </a>
            </li>
          )}
          {CONTACT.telegramSecondary && (
            <li>
              <a href={telegramHref(CONTACT.telegramSecondary)} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                @{CONTACT.telegramSecondary}
              </a>
            </li>
          )}
          {CONTACT.instagramUrl && (
            <li>
              <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                Instagram · stepschool.kids
              </a>
            </li>
          )}
        </ul>
      </div>
      <div className="container-x flex flex-col gap-1 border-t border-white/10 py-5 text-xs text-white/35 sm:flex-row sm:justify-between">
        <p>© {new Date().getFullYear()} {SITE.name}</p>
        <p>{SITE.domain}</p>
      </div>
    </footer>
  );
}
