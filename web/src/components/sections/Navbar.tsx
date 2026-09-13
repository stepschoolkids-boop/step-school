"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { Footprint } from "@/components/brand/Footprint";
import { Icon } from "@/components/ui/Icon";
import { CTA, NAV_ITEMS } from "@/content/nav";
import { CONTACT, telHref } from "@/content/site";
import { EASE, usePrefersReducedMotion } from "@/lib/motion";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const reduced = usePrefersReducedMotion();

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 24));

  // lock body scroll while the mobile menu is open
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
      <div
        className={`relative z-50 transition-[background,box-shadow] duration-300 ${
          open ? "bg-transparent" : scrolled ? "nav-glass shadow-[0_8px_30px_-18px_rgba(20,35,43,0.35)]" : ""
        }`}
      >
        <nav className="container-x flex h-[68px] items-center justify-between gap-4" aria-label="Asosiy navigatsiya">
          <Logo compact={scrolled && !open} onDark={open} />

          <ul className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group relative rounded-full px-3.5 py-2 text-[0.95rem] font-semibold text-ink-soft transition-colors hover:text-ink"
                >
                  {item.label}
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-[3px] origin-left scale-x-0 rounded-full bg-sun transition-transform duration-300 group-hover:scale-x-100" />
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            {CONTACT.phone && (
              <a
                href={telHref(CONTACT.phone)}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.95rem] font-bold text-ink hover:bg-ink/5 md:inline-flex"
              >
                <Icon name="phone" className="size-4 text-green" />
                {CONTACT.phone}
              </a>
            )}
            <Link href={CTA.href} className="btn-primary hidden h-11 items-center rounded-full px-5 font-display font-semibold sm:inline-flex">
              {CTA.short}
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              className={`grid size-11 place-items-center rounded-full border lg:hidden ${open ? "border-white/20 bg-white/10 text-white" : "border-ink/10 bg-paper text-ink"}`}
            >
              <Icon name={open ? "close" : "menu"} className="size-5" />
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-ink/95 text-white backdrop-blur-sm lg:hidden"
          >
            <div className="container-x flex h-full flex-col pt-[84px] pb-8">
              <Footprint className="absolute right-[-10%] top-[10%] w-[55%] rotate-12 fill-white/[0.04]" />
              <ul className="flex flex-1 flex-col justify-center gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: reduced ? 0 : -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.06 + i * 0.05, duration: 0.45, ease: EASE }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between rounded-2xl px-3 py-3.5 font-display text-[1.9rem] font-semibold tracking-tight hover:bg-white/5"
                    >
                      {item.label}
                      <Icon name="arrow" className="size-6 text-sun" />
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <motion.div
                initial={{ opacity: 0, y: reduced ? 0 : 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.36, duration: 0.45, ease: EASE }}
                className="flex flex-col gap-3"
              >
                <Link
                  href={CTA.href}
                  onClick={() => setOpen(false)}
                  className="btn-primary inline-flex h-14 items-center justify-center rounded-full font-display text-lg font-semibold"
                >
                  {CTA.full}
                </Link>
                {CONTACT.phone && (
                  <a href={telHref(CONTACT.phone)} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/15 font-bold">
                    <Icon name="phone" className="size-4 text-sun" /> {CONTACT.phone}
                  </a>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
