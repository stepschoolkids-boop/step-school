"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState, type PointerEvent } from "react";
import { Book as BookCard } from "@/components/brand/Book";
import { Icon, type IconName } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BOOKS, type Book } from "@/content/books";
import { FACTS } from "@/content/site";
import { useFinePointer, usePrefersReducedMotion } from "@/lib/motion";

/** A few high-value, verified concepts — the full list lives on the phase-2 Books page. */
const CONCEPTS: { icon: IconName; text: string }[] = [
  { icon: "riko", text: "Riko grammatikani o‘rgatadi" },
  { icon: "uz", text: "Qoidalar ostida o‘zbekcha izoh" },
  { icon: "mistake", text: "Har darsda «Rikoning xatosi»" },
  { icon: "parent", text: "Ota-ona tekshira oladi" },
];

function TiltBook({ book, index }: { book: Book; index: number }) {
  const fine = useFinePointer();
  const reduced = usePrefersReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 120, damping: 16 });
  const sry = useSpring(ry, { stiffness: 120, damping: 16 });
  const glowX = useTransform(sry, [-14, 14], ["20%", "80%"]);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!fine || reduced) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 28);
    rx.set(-py * 22);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <article className="w-[62vw] max-w-[260px] shrink-0 sm:w-[38vw] lg:w-[clamp(200px,14.5vw,236px)]">
      <div className="book-scene" onPointerMove={onMove} onPointerLeave={reset}>
        <motion.div
          style={{ rotateX: srx, rotateY: sry }}
          whileTap={reduced ? undefined : { scale: 0.98, rotateY: -8 }}
          className="book-3d relative cursor-pointer"
          tabIndex={0}
          aria-label={`${book.title} — ${book.concept}`}
        >
          <motion.div
            style={{ left: glowX, background: `radial-gradient(circle, ${book.color}55, transparent 60%)` }}
            className="pointer-events-none absolute -inset-[8%] -z-10 -translate-x-1/2 rounded-full blur-2xl"
            aria-hidden="true"
          />
          <BookCard book={book} priority={index === 0} withRiko />
        </motion.div>
      </div>
      <div className="mt-6">
        <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-ink/45">Step 0{book.step}</p>
        <h3 className="mt-1 font-display text-[1.15rem] font-semibold text-ink">{book.title}</h3>
        <p className="text-ink/60">{book.concept}</p>
        <p className="mt-2 text-sm leading-relaxed text-ink/45">{book.promise}</p>
      </div>
    </article>
  );
}

/**
 * Four books. Desktop: sticky scene where the shelf slides horizontally with scroll.
 * Phones/tablets: native snap scroller with touch. Hover tilt on fine pointers only.
 */
export function Books() {
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLUListElement>(null);
  const [shift, setShift] = useState(0);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(scrollYProgress, [0.08, 0.92], [0, -shift]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => setShift(Math.max(0, el.scrollWidth - el.clientWidth));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <section ref={ref} id="kitoblar" className="relative bg-canvas lg:h-[280vh]" aria-labelledby="books-title">
      <div className="relative flex flex-col justify-center overflow-hidden py-20 sm:py-28 lg:sticky lg:top-0 lg:h-svh lg:py-0 lg:pt-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div className="absolute left-1/2 top-[40%] h-[60vmin] w-[90vmin] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,rgba(61,139,255,0.16),transparent_60%)]" />
        </div>

        <div className="container-x relative">
          <SectionHeading
            eyebrow={`${FACTS.books} kitob · ${FACTS.years} yil`}
            id="books-title"
            title={
              <>
                Har kitob — <span className="text-green-ink">keyingi qadam</span>
              </>
            }
            text="STEP SCHOOL KIDS uchun maxsus yozilgan to‘rt kitob. Riko har sahifada bola bilan."
          />
        </div>

        {/* Desktop: scroll-driven shelf */}
        <div className="relative mt-8 hidden lg:block">
          <motion.ul ref={trackRef} style={{ x: reduced ? 0 : x }} className="flex gap-[7.5vw] pl-[max(1.25rem,calc((100vw-80rem)/2+3rem))] pr-[8vw]">
            {BOOKS.map((b, i) => (
              <li key={b.step}>
                <TiltBook book={b} index={i} />
              </li>
            ))}
            <li className="flex w-[24vw] shrink-0 items-center pr-4">
              <ConceptsColumn />
            </li>
          </motion.ul>
        </div>

        {/* Phones / tablets: native snap scroller */}
        <div className="mt-10 lg:hidden">
          <ul className="snap-x-scroller gap-[30vw] px-[clamp(1.25rem,4vw,3rem)] pr-[34vw]" aria-label="Kitoblar">
            {BOOKS.map((b, i) => (
              <li key={b.step}>
                <Reveal delay={i * 0.05}>
                  <TiltBook book={b} index={i} />
                </Reveal>
              </li>
            ))}
          </ul>
          <div className="container-x mt-10">
            <ConceptsColumn />
          </div>
        </div>
      </div>
    </section>
  );
}

function ConceptsColumn() {
  return (
    <ul className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1" aria-label="Kitoblarning asosiy xususiyatlari">
      {CONCEPTS.map((c, i) => (
        <Reveal as="li" key={c.text} delay={i * 0.06} y={14} className="glass flex items-center gap-3 rounded-2xl px-4 py-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-green/15 text-green-ink">
            <Icon name={c.icon} className="size-4.5" />
          </span>
          <span className="text-[0.95rem] font-semibold text-ink/85">{c.text}</span>
        </Reveal>
      ))}
    </ul>
  );
}
