"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Footprint } from "@/components/brand/Footprint";
import { Icon } from "@/components/ui/Icon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { CTA, NAV_ITEMS } from "@/content/nav";
import { CONTACT, telHref, telegramHref } from "@/content/site";
import { EASE, EASE_OUT_EXPO, usePrefersReducedMotion } from "@/lib/motion";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const reduced = usePrefersReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 40));

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        initial={{ opacity: 0, y: reduced ? 0 : -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: reduced ? 0 : 0.1, duration: 0.7, ease: EASE_OUT_EXPO }}
        className={`relative z-50 transition-[background,box-shadow] duration-300 ${!open && scrolled ? "nav-glass shadow-[0_10px_40px_-20px_var(--nav-shadow)]" : ""}`}
      >
        <nav className="container-x flex h-[68px] items-center justify-between gap-4" aria-label="Asosiy navigatsiya">
          <Logo compact={scrolled && !open} />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="group relative rounded-full px-3.5 py-2 text-[0.92rem] font-semibold text-ink/65 transition-colors hover:text-ink">
                  {item.label}
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-[2px] origin-left scale-x-0 rounded-full bg-green transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href={CTA.href} className="btn-primary hidden h-11 items-center rounded-full px-5 text-[0.95rem] font-bold sm:inline-flex">
              {CTA.short}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              className="grid size-11 place-items-center rounded-full border border-ink/15 bg-ink/5 text-ink lg:hidden"
            >
              <Icon name={open ? "close" : "menu"} className="size-5" />
            </button>
          </div>
        </nav>
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, clipPath: reduced ? "inset(0 0 0 0)" : "inset(0 0 100% 0 round 0 0 40px 40px)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0 round 0 0 0px 0px)" }}
            exit={{ opacity: 0, clipPath: reduced ? "inset(0 0 0 0)" : "inset(0 0 100% 0 round 0 0 40px 40px)" }}
            transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
            className="fixed inset-0 z-40 bg-canvas text-ink lg:hidden"
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden="true">
              <div className="absolute -right-[20%] -top-[10%] h-[70vmin] w-[70vmin] rounded-full bg-[radial-gradient(circle,rgba(61,139,255,0.3),transparent_60%)]" />
              <div className="absolute -left-[20%] bottom-[-10%] h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle,rgba(47,214,127,0.22),transparent_60%)]" />
              <Footprint className="absolute right-[-8%] top-[14%] w-[52%] rotate-12 fill-ink/[0.04]" />
            </div>
            <div className="container-x relative flex h-full flex-col pt-[88px] pb-8">
              <ul className="flex flex-1 flex-col justify-center gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: reduced ? 0 : 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 + i * 0.06, duration: 0.5, ease: EASE }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-3 py-4 font-display text-[1.7rem] font-semibold tracking-tight hover:bg-ink/5"
                    >
                      {item.label}
                      <Icon name="arrow" className="size-6 text-green-ink" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.42, duration: 0.5, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <Link href={CTA.href} onClick={() => setOpen(false)} className="btn-primary inline-flex h-14 items-center justify-center rounded-full text-lg font-bold">
                  {CTA.full}
                </Link>
                <div className="flex gap-3">
                  {CONTACT.phone && (
                    <a href={telHref(CONTACT.phone)} className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-ink/15 font-bold">
                      <Icon name="phone" className="size-4 text-green-ink" /> {CONTACT.phone}
                    </a>
                  )}
                  {CONTACT.telegramUsername && (
                    <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" aria-label={`Telegram @${CONTACT.telegramUsername}`} className="grid size-12 place-items-center rounded-full border border-ink/15">
                      <Icon name="telegram" className="size-5 text-blue-ink" />
                    </a>
                  )}
                  {CONTACT.instagramUrl && (
                    <a href={CONTACT.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label={`Instagram @${CONTACT.instagramUsername ?? "stepschool.kids"}`} className="grid size-12 place-items-center rounded-full border border-ink/15">
                      <Icon name="instagram" className="size-5 text-coral" />
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
