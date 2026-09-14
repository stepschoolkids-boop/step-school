# STEP SCHOOL KIDS — website

Marketing website for **STEP SCHOOL KIDS** (English for children aged 7–12), built to turn
Instagram/Telegram visitors into trial-lesson signups. Uzbek-first, mobile-first, animated.

Production domain (to be connected): **https://stepschoolkids.uz**

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- `motion` (Framer Motion) for the hero entrance choreography, sticky scroll scenes and reveals
- No UI kit, no icon library — line icons are inline SVG; the logo, Riko and book covers are the **official image assets**

## Visual system (v2)

Navy foundation (`#050a17` → `#0d1a3a`), blue and green light, white type. Display face **Unbounded**,
body **Manrope**. The paw mark from the official logo is the recurring motif (trail, bullets, pattern);
the official Riko is the guide, with a dedicated pose per book; book accent colours are sampled from the covers. One continuous story:
hero entrance (footprint → path → Riko → kinetic "STEP" → tagline → CTA) → sticky START/SPEAK/READ/WIN
scene → books shelf → 1 yil / 156 dars → 90-minute lesson → trust & terms → "Birinchi qadam shu yerdan
boshlanadi" form. All motion is transform/opacity only and collapses under `prefers-reduced-motion`.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks + lints)
npm run start
npm run lint
```

## Official brand assets

Every logo, Riko pose and book cover is an official file under `public/assets/` and is registered once in
`src/content/assets.ts` (path, intrinsic size, alt text). Components (`brand/Logo`, `brand/Riko`, `brand/Book`)
read from that registry — no image path is hard-coded anywhere else.

| Key | File | Used in |
|---|---|---|
| `brand.logo` | `assets/brand/logo.png` | navbar, footer |
| `brand.logoMark` | `assets/brand/logo-mark.png` | compact navbar, web manifest, favicon (`src/app/icon.png`) |
| `riko.hero` | `assets/riko/riko-hero.png` | hero |
| `riko.start` / `speak` / `read` / `win` | `assets/riko/riko-*.png` | each book card, journey stage, lesson panel, form success, 404 |
| `books.start` / `speak` / `read` / `win` | `assets/books/book-*.png` | books shelf, journey cover |

`npm run assets:check` lists any file the registry expects but `public/` does not contain.
See `public/assets/README.md` for the drop-in checklist.

## Where the content lives

All business content is data, separate from UI, under `src/content/`:

| File | What |
|---|---|
| `site.ts` | Name, domain, verified facts (ages, 90-min lessons, 4 books / 156 lessons), **contact data**, response promise |
| `books.ts` | The 4 books (Start/Speak/Read/Win, Riko!) and the 12 verified book differentiators |
| `lesson.ts` | Stages of the 90-minute lesson (no per-stage timings — not verified) |
| `schedule.ts` | Group schedule + pricing structures (**empty until real data exists**) |
| `teachers.ts` | Teacher profiles (**empty until real data exists**) — rendered as compact chips in the trust band |
| `nav.ts` | Navigation and CTA labels |

### Rule: nothing invented

Fields that are not verified are `null`/empty and the UI renders an honest fallback
(e.g. "Narxni so‘rov bo‘yicha aytamiz", "Xarita tez orada"). To light up a section, fill the data:

- **Prices & groups** → `schedule.ts` (`GROUPS`, `PRICE`)
- **Teachers** → `teachers.ts` (`TEACHERS`, photos in `public/teachers/`)
- **Address / map / hours / Instagram / entrance photo** → `site.ts` (`CONTACT`)
- **Book covers / Riko / logo** → replace the files under `public/assets/` (see above)
- **"We'll contact you within 1 hour"** → `site.ts` (`RESPONSE_PROMISE`) once approved

Phone (+998 99 141 49 48), both Telegram handles (@Stepschooladmin_Muslima, @stepschool_kids) and Instagram
(stepschool.kids) are the official STEP SCHOOL KIDS contacts, confirmed by the school on 14 Sept 2026.

## Trial-lesson form

`src/components/sections/TrialForm.tsx` posts to `src/app/api/trial/route.ts`.
The endpoint validates the lead and forwards it to a Telegram chat when these env vars are set:

```
TRIAL_TELEGRAM_BOT_TOKEN=<bot token>
TRIAL_TELEGRAM_CHAT_ID=<chat id that receives leads>
```

Without them it responds `503 NOT_CONFIGURED` and the form shows call/Telegram fallbacks —
it never pretends a lead was sent. Swap the Telegram call for a CRM/Sheets integration in the same file if needed.

## Structure

```
src/app/            layout (fonts, metadata, JSON-LD), page, api/trial, robots, sitemap, OG image, icon
src/components/
  brand/            Riko, Footprint, Logo, BookCover
  ui/               Button (magnetic), Reveal, SectionHeading, CountUp, Icon
  sections/         Navbar, Hero, Journey, Books, Stats, LessonTimeline, TrustBand,
                    FinalCta (+ TrialForm), Footer, MobileCtaBar
src/content/        all copy and business data
src/lib/motion.ts   shared easing/variants + reduced-motion hook
```

Phase-2 pages (Kitoblar, Ota-onalar uchun, Natijalar, Biz haqimizda) can be added as routes under
`src/app/` and linked from `src/content/nav.ts` + `src/app/sitemap.ts`.

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full checklist (Render or Vercel, env vars,
custom domain `stepschoolkids.uz`, post-launch checks). `npm run check` runs lint + typecheck + build,
the same as CI (`.github/workflows/web-ci.yml`).

Accessibility and motion: semantic landmarks, one `h1`, labelled form fields, visible focus
states, `prefers-reduced-motion` disables parallax and cinematic motion while keeping all content.
