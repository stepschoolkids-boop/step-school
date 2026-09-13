"use client";

import { motion } from "motion/react";
import { BookCover } from "@/components/brand/BookCover";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BOOKS, BOOK_FEATURES } from "@/content/books";
import { FACTS } from "@/content/site";
import { EASE, usePrefersReducedMotion } from "@/lib/motion";

/** Desktop arrangement: books fan out from the centre and settle into an arc. */
const ARC = [
  { x: -6, y: 26, r: -9 },
  { x: -2, y: 6, r: -3 },
  { x: 2, y: 6, r: 3 },
  { x: 6, y: 26, r: 9 },
];

export function BooksShowcase() {
  const reduced = usePrefersReducedMotion();
  return (
    <section id="kitoblar" className="relative isolate overflow-hidden bg-paper py-20 sm:py-28" aria-labelledby="books-title">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-footprints opacity-50" aria-hidden="true" />
      <div className="container-x">
        <SectionHeading
          align="center"
          eyebrow="Bizning kitoblar"
          id="books-title"
          title={
            <>
              {FACTS.books} kitob — bir yillik <span className="text-green">o‘z tizimimiz</span>
            </>
          }
          text="Kitoblar STEP SCHOOL KIDS uchun maxsus yozilgan. Riko har sahifada bola bilan: tushuntiradi, xato qiladi, o‘yin o‘ynaydi."
        />

        {/* Desktop cinematic stage */}
        <div className="book-scene mt-16 hidden lg:block">
          <ul className="mx-auto grid max-w-5xl grid-cols-4 items-end gap-6">
            {BOOKS.map((b, i) => (
              <motion.li
                key={b.step}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 120, x: `${-ARC[i].x * 8}%`, scale: 0.85 }}
                whileInView={{ opacity: 1, y: ARC[i].y, x: `${ARC[i].x}%`, scale: 1 }}
                viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
                className="relative"
              >
                <motion.div
                  initial={{ rotate: 0 }}
                  whileInView={{ rotate: reduced ? 0 : ARC[i].r }}
                  viewport={{ once: true, margin: "0px 0px -15% 0px" }}
                  transition={{ duration: 1, delay: i * 0.12, ease: EASE }}
                >
                  <BookCover book={b} />
                </motion.div>
                <div className="mt-8 text-center">
                  <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink-mute">Step 0{b.step}</p>
                  <p className="font-display text-xl font-semibold">{b.title}</p>
                  <p className="text-ink-soft">{b.concept}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Mobile / tablet: snap scroller */}
        <div className="mt-12 lg:hidden">
          <ul className="snap-x-scroller -mx-5 px-5 sm:-mx-10 sm:px-10" aria-label="Kitoblar">
            {BOOKS.map((b, i) => (
              <li key={b.step} className="w-[68vw] max-w-[280px] sm:w-[40vw]">
                <Reveal delay={i * 0.06}>
                  <BookCover book={b} />
                  <div className="mt-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink-mute">Step 0{b.step}</p>
                    <p className="font-display text-xl font-semibold">{b.title}</p>
                    <p className="text-ink-soft">{b.concept}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-mute">
            <Icon name="arrow" className="size-4" /> Suring
          </p>
        </div>

        {/* Differentiators */}
        <div className="mt-24">
          <Reveal>
            <h3 className="headline text-center text-[clamp(1.7rem,4vw,2.6rem)]">Kitoblar ichida nima bor?</h3>
          </Reveal>
          <ul className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {BOOK_FEATURES.map((f, i) => (
              <Reveal as="li" key={f.title} delay={(i % 4) * 0.06} y={18} className="card group relative flex gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-green-light text-green-deep transition-transform duration-300 group-hover:-rotate-6">
                  <Icon name={f.icon} className="size-5" />
                </span>
                <div>
                  <p className="font-display text-[1.05rem] font-semibold leading-tight">
                    {f.badge && <span className="mr-1.5 rounded-md bg-sun px-1.5 py-0.5 font-display text-sm text-ink">{f.badge}</span>}
                    {f.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-soft">{f.text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
