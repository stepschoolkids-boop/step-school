"use client";

import { motion } from "motion/react";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BENEFITS } from "@/content/benefits";
import { EASE, usePrefersReducedMotion } from "@/lib/motion";

const TONES = [
  { bg: "bg-green-light", fg: "text-green-deep", ring: "group-hover:ring-green/40" },
  { bg: "bg-sky-light", fg: "text-sky-deep", ring: "group-hover:ring-sky/40" },
  { bg: "bg-sun-light", fg: "text-sun-deep", ring: "group-hover:ring-sun/50" },
  { bg: "bg-coral-light", fg: "text-coral-deep", ring: "group-hover:ring-coral/40" },
];

export function Benefits() {
  const reduced = usePrefersReducedMotion();
  return (
    <section className="relative py-20 sm:py-28" aria-labelledby="benefits-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="Nega STEP SCHOOL KIDS"
          id="benefits-title"
          title={
            <>
              Bola uchun <span className="text-green">tushunarli</span>, ota‑ona uchun <span className="text-coral">ko‘rinadigan</span> natija
            </>
          }
          text="Biz tayyor darslik olib emas, 7–12 yoshdagi bolalar uchun o‘z tizimimizni yaratdik. Mana uning to‘rt asosi."
        />

        <ul className="mt-14 grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((b, i) => {
            const t = TONES[i % TONES.length];
            return (
              <motion.li
                key={b.number}
                initial={{ opacity: 0, y: reduced ? 0 : 40, rotate: reduced ? 0 : (i % 2 ? 1.5 : -1.5) }}
                whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.7, delay: i * 0.08, ease: EASE }}
                whileHover={reduced ? undefined : { y: -6 }}
                className={`card group relative overflow-hidden p-7 ring-1 ring-transparent transition-shadow duration-300 hover:shadow-[var(--shadow-soft)] sm:p-9 ${t.ring}`}
              >
                <span className="headline pointer-events-none absolute -right-2 -top-6 select-none text-[7rem] leading-none text-ink/[0.045] transition-transform duration-500 group-hover:-translate-y-2">
                  {b.number}
                </span>
                <span className={`inline-grid size-14 place-items-center rounded-2xl ${t.bg} ${t.fg} transition-transform duration-500 group-hover:rotate-[-8deg] group-hover:scale-105`}>
                  <Icon name={b.icon} className="size-7" />
                </span>
                <h3 className="headline mt-6 text-[1.7rem] sm:text-[2rem]">{b.title}</h3>
                <p className="mt-3 max-w-md text-pretty leading-relaxed text-ink-soft">{b.text}</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
