import Image from "next/image";
import { ASSETS } from "@/content/assets";
import type { Book as BookData } from "@/content/books";

type BookProps = {
  book: BookData;
  className?: string;
  priority?: boolean;
  sizes?: string;
  /** Show the book's own Riko standing beside the cover (right side, never over the title). */
  withRiko?: boolean;
  decorative?: boolean;
};

/**
 * A premium physical book built around the official cover artwork.
 * Spine, page block, soft gloss and layered shadow are pure CSS; the cover
 * itself is the untouched asset (object-cover on the cover's own aspect ratio).
 */
export function Book({ book, className = "", priority = false, sizes = "(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 280px", withRiko = false, decorative = false }: BookProps) {
  const cover = ASSETS.books[book.key];
  const riko = ASSETS.riko[book.key];
  return (
    <div className={`relative ${className}`}>
      <div
        className="book-3d relative w-full select-none rounded-[6px_14px_14px_6px] shadow-[0_40px_60px_-28px_var(--shadow-deep),0_12px_24px_-12px_var(--shadow-soft)]"
        style={{ aspectRatio: `${cover.width} / ${cover.height}` }}
      >
        <span className="book-spine" style={{ background: "rgba(0,0,0,0.45)" }} aria-hidden="true" />
        <span className="book-pages" aria-hidden="true" />
        <Image
          src={cover.src}
          alt={decorative ? "" : cover.alt}
          aria-hidden={decorative || undefined}
          fill
          priority={priority}
          sizes={sizes}
          className="rounded-[6px_14px_14px_6px] object-cover"
          draggable={false}
        />
        {/* binding crease + gloss — light only, never colour */}
        <span className="pointer-events-none absolute inset-y-0 left-[4%] w-px bg-white/25" aria-hidden="true" />
        <span className="pointer-events-none absolute inset-0 rounded-[6px_14px_14px_6px] bg-[linear-gradient(115deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_38%,rgba(0,0,0,0)_70%,rgba(0,0,0,0.18))]" aria-hidden="true" />
      </div>
      {withRiko && (
        <span
          className="pointer-events-none absolute -bottom-[3%] -right-[38%] block w-[54%] drop-shadow-[0_18px_24px_var(--shadow-deep)]"
          style={{ aspectRatio: `${riko.width} / ${riko.height}` }}
          aria-hidden="true"
        >
          <Image src={riko.src} alt="" fill sizes="(max-width: 640px) 40vw, 200px" className="object-contain" draggable={false} />
        </span>
      )}
    </div>
  );
}
