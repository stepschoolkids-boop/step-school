/**
 * STEP SCHOOL KIDS — official brand asset registry.
 *
 * Single source of truth for every logo, Riko and book-cover file.
 * Components never hard-code image paths; they read from here. To swap an
 * asset, replace the file at the path (or update the entry) — nothing else.
 *
 * Files live under /public/assets/…  Keep the formats the school supplies:
 *   • Riko + logo → PNG with transparent background (they sit on navy)
 *   • Book covers → PNG/JPG, exact official artwork, no re-rendering
 *
 * `width`/`height` are the intrinsic pixel sizes used by next/image to reserve
 * layout (no CLS). Update them to the real file dimensions after dropping the
 * assets in — the browser always renders the file's true aspect ratio.
 */

export type ImageAsset = { src: string; width: number; height: number; alt: string };

export type RikoVariant = "hero" | "start" | "speak" | "read" | "win" | "general";
export type BookKey = "start" | "speak" | "read" | "win";

const riko = (file: string, alt: string, width: number, height: number): ImageAsset => ({ src: `/assets/riko/${file}`, width, height, alt });
const cover = (file: string, alt: string, width: number, height: number): ImageAsset => ({ src: `/assets/books/${file}`, width, height, alt });

export const ASSETS = {
  brand: {
    /** Primary logo — paw mark + "Step Kids" wordmark, horizontal, transparent background. */
    logo: { src: "/assets/brand/logo.png", width: 254, height: 114, alt: "STEP SCHOOL KIDS" } satisfies ImageAsset,
    /** Same wordmark with navy letters — used on the light theme (white letters would vanish). */
    logoLight: { src: "/assets/brand/logo-light.png", width: 254, height: 114, alt: "STEP SCHOOL KIDS" } satisfies ImageAsset,
    /** Paw mark only — used for compact contexts (app icon, small badges). */
    logoMark: { src: "/assets/brand/logo-mark.png", width: 168, height: 170, alt: "STEP SCHOOL KIDS" } satisfies ImageAsset,
  },
  riko: {
    /** TODO: no dedicated hero Riko supplied yet — riko-hero.png is currently a copy of the Speak pose. */
    hero: riko("riko-hero.png", "Riko — STEP SCHOOL KIDS qahramoni", 854, 1167),
    start: riko("riko-start.png", "Riko tuxumdan chiqmoqda — Start, Riko!", 216, 225),
    speak: riko("riko-speak.png", "Riko qalam va daftar bilan — Speak, Riko!", 854, 1167),
    read: riko("riko-read.png", "Riko ko‘zoynakda kitob o‘qiyapti — Read, Riko!", 878, 1167),
    win: riko("riko-win.png", "Riko bitiruv kiyimida kubok bilan — Win, Riko!", 1112, 1137),
    general: riko("riko-hero.png", "Riko", 854, 1167),
  } satisfies Record<RikoVariant, ImageAsset>,
  books: {
    start: cover("book-start.png", "Start, Riko! — First words. 1-kitob muqovasi", 295, 414),
    speak: cover("book-speak.png", "Speak, Riko! — First sentences. 2-kitob muqovasi", 295, 414),
    read: cover("book-read.png", "Read, Riko! — First stories. 3-kitob muqovasi", 295, 414),
    win: cover("book-win.png", "Win, Riko! — Ready for English. 4-kitob muqovasi", 295, 414),
  } satisfies Record<BookKey, ImageAsset>,
} as const;

/** Every file the site expects — used by `npm run assets:check`. */
export const ASSET_FILES: string[] = [
  ASSETS.brand.logo.src,
  ASSETS.brand.logoLight.src,
  ASSETS.brand.logoMark.src,
  ...Object.values(ASSETS.riko).map((a) => a.src),
  ...Object.values(ASSETS.books).map((a) => a.src),
].filter((v, i, arr) => arr.indexOf(v) === i);
