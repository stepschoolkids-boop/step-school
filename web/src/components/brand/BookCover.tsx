import Image from "next/image";
import type { Book, BookTone } from "@/content/books";
import { Footprint } from "./Footprint";
import { Riko } from "./Riko";

const TONES: Record<BookTone, { from: string; to: string; ink: string; accent: string; spine: string }> = {
  green: { from: "#3fc484", to: "#147a4a", ink: "#ffffff", accent: "#ffc233", spine: "#0f5d38" },
  sky: { from: "#5cc4ee", to: "#1d8fc1", ink: "#ffffff", accent: "#ffc233", spine: "#166f97" },
  sun: { from: "#ffd45c", to: "#f0a400", ink: "#14232b", accent: "#ff6a3d", spine: "#c78600" },
  coral: { from: "#ff8a66", to: "#e2522a", ink: "#ffffff", accent: "#ffc233", spine: "#b83f1d" },
};

/**
 * Book cover. Renders the real artwork when `book.cover` is set; otherwise a
 * generated brand cover so the layout never shows a broken image.
 * Aspect ratio 3:4 like the printed books.
 */
export function BookCover({ book, className = "", priority = false }: { book: Book; className?: string; priority?: boolean }) {
  const t = TONES[book.tone];
  return (
    <div
      className={`book-3d relative aspect-[3/4] w-full select-none rounded-[6px_16px_16px_6px] shadow-[0_30px_50px_-24px_rgba(20,35,43,0.55),0_2px_0_rgba(255,255,255,0.35)_inset] ${className}`}
    >
      <span className="book-spine" style={{ background: t.spine }} aria-hidden="true" />
      <span className="book-pages" aria-hidden="true" />
      {book.cover ? (
        <Image
          src={book.cover}
          alt={`${book.title} — ${book.concept}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 260px"
          className="rounded-[6px_16px_16px_6px] object-cover"
        />
      ) : (
        <div
          className="@container absolute inset-0 overflow-hidden rounded-[6px_16px_16px_6px]"
          style={{ background: `linear-gradient(160deg, ${t.from}, ${t.to})`, color: t.ink }}
          role="img"
          aria-label={`${book.title} — ${book.concept}. ${book.step}-kitob muqovasi`}
        >
          {/* left binding highlight */}
          <span className="absolute inset-y-0 left-0 w-[8%] bg-black/10" />
          <span className="absolute inset-y-0 left-[8%] w-px bg-white/25" />

          {/* footprint pattern */}
          <Footprint className="absolute -right-6 -top-6 w-[42%] rotate-[22deg] fill-white/15" />
          <Footprint className="absolute -left-2 bottom-[28%] w-[26%] -rotate-[18deg] fill-white/10" />

          <div className="absolute left-[16%] right-[8%] top-[9%] flex items-center justify-between [container-type:inline-size]">
            <span className="rounded-full bg-black/15 px-2 py-0.5 text-[clamp(0.32rem,3.2cqw,0.6rem)] font-extrabold uppercase tracking-[0.2em]">
              Step 0{book.step}
            </span>
            <span className="text-[clamp(0.32rem,3.2cqw,0.6rem)] font-bold uppercase tracking-[0.18em] opacity-80">Kids</span>
          </div>

          <div className="absolute left-[16%] right-[8%] top-[24%] hidden @min-[120px]:block">
            <p className="font-display text-[clamp(0.7rem,8.5cqw,2.2rem)] font-bold leading-[0.95] tracking-tight [container-type:inline-size]">
              {book.title.split(",")[0]},
              <br />
              Riko!
            </p>
            <p className="mt-2 text-[clamp(0.38rem,4cqw,0.72rem)] font-semibold uppercase tracking-[0.16em] opacity-85 [container-type:inline-size]">{book.conceptEn}</p>
          </div>

          <Riko className="absolute -bottom-[6%] -right-[8%] w-[70%] drop-shadow-[0_12px_18px_rgba(0,0,0,0.25)]" />

          <div
            className="absolute bottom-[7%] left-[16%] h-1.5 w-[30%] rounded-full"
            style={{ background: t.accent }}
          />
        </div>
      )}
      {/* gloss */}
      <span className="pointer-events-none absolute inset-0 rounded-[6px_16px_16px_6px] bg-gradient-to-br from-white/25 via-transparent to-black/10" aria-hidden="true" />
    </div>
  );
}
