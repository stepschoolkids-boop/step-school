"use client";

import Link from "next/link";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { CTA } from "@/content/nav";
import { CONTACT, telHref } from "@/content/site";

/**
 * Sticky bottom CTA for phones (Instagram/Telegram traffic).
 * Appears after the hero, hides while the trial form itself is on screen.
 */
export function MobileCtaBar() {
  const { scrollY } = useScroll();
  const [pastHero, setPastHero] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => setPastHero(y > window.innerHeight * 0.9));

  useEffect(() => {
    const el = document.getElementById("sinov-darsi");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setFormVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const show = pastHero && !formVisible;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
          className="fixed inset-x-3 bottom-3 z-40 flex gap-2 sm:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <Link href={CTA.href} className="btn-primary inline-flex h-13 flex-1 items-center justify-center gap-2 rounded-full font-bold">
            {CTA.full} <Icon name="arrow" className="size-4" />
          </Link>
          {CONTACT.phone && (
            <a href={telHref(CONTACT.phone)} aria-label={`Qo‘ng‘iroq: ${CONTACT.phone}`} className="nav-glass grid size-13 place-items-center rounded-full border border-ink/15 text-ink">
              <Icon name="phone" className="size-5" />
            </a>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
