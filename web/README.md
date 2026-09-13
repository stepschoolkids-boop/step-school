# STEP SCHOOL KIDS — website

Marketing website for **STEP SCHOOL KIDS** (English for children aged 7–12), built to turn
Instagram/Telegram visitors into trial-lesson signups. Uzbek-first, mobile-first, animated.

Production domain (to be connected): **https://stepschoolkids.uz**

## Stack

- Next.js 15 (App Router) · React 19 · TypeScript
- Tailwind CSS v4 (design tokens in `src/app/globals.css`)
- `motion` (Framer Motion) for scroll-linked and entrance animation
- No UI kit, no icon library — Riko, the footprint mark, book covers and icons are hand-drawn SVG components

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (also type-checks + lints)
npm run start
npm run lint
```

## Where the content lives

All business content is data, separate from UI, under `src/content/`:

| File | What |
|---|---|
| `site.ts` | Name, domain, verified facts (150 students, 13 groups, 90-min lessons…), **contact data**, response promise |
| `books.ts` | The 4 books (Start/Speak/Read/Win, Riko!) and the 12 verified book differentiators |
| `benefits.ts` | The 4 "Why STEP SCHOOL KIDS" cards |
| `lesson.ts` | Stages of the 90-minute lesson (no per-stage timings — not verified) |
| `schedule.ts` | Group schedule + pricing structures (**empty until real data exists**) |
| `teachers.ts` | Teacher profiles (**empty until real data exists**) + verified teacher-selection principle |
| `nav.ts` | Navigation and CTA labels |

### Rule: nothing invented

Fields that are not verified are `null`/empty and the UI renders an honest fallback
(e.g. "Narxni so‘rov bo‘yicha aytamiz", "Xarita tez orada"). To light up a section, fill the data:

- **Prices & groups** → `schedule.ts` (`GROUPS`, `PRICE`)
- **Teachers** → `teachers.ts` (`TEACHERS`, photos in `public/teachers/`)
- **Address / map / hours / Instagram / entrance photo** → `site.ts` (`CONTACT`)
- **Real book covers** → drop files in `public/books/` and set `cover` in `books.ts`
- **"We'll contact you within 1 hour"** → `site.ts` (`RESPONSE_PROMISE`) once approved

The phone number and Telegram handle are the official STEP SCHOOL KIDS contacts, confirmed by the
school (they are shared with the school's Telegram bot config in `app/config.py`).

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
  sections/         Navbar, Hero, FootprintJourney, Benefits, BooksShowcase, CurriculumTimeline,
                    LessonFlow, Teachers, TrustSection, Schedule, TrialForm, Contact, Footer, MobileCtaBar
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
