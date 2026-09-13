# Deploying stepschoolkids.uz

The site is a standard Next.js 15 server (Node 22). A Node runtime is required because of the
`/api/trial` lead endpoint and the generated Open Graph image — a purely static export will not work.

> DNS for `stepschoolkids.uz` is **not** changed by anything in this repository. The records below
> are documentation for whoever manages the domain, to be applied only when the site is ready to go live.

## 0. Before deploying

- [ ] Fill any newly available data in `src/content/` (prices, teachers, address, Instagram). Nothing is invented; empty fields render honest fallbacks.
- [ ] Decide where trial-lesson leads should arrive (see §3).
- [ ] `npm run check` passes locally (lint + typecheck + build). CI runs the same on every PR touching `web/`.

## 1. Render — the live service

The web service already exists in the Render workspace **"step's workspace"** (same account as the Telegram bot):

| | |
|---|---|
| Service | `step-school-kids-web` (`srv-daj6puuk1f9s73cg8r8g`) |
| Live URL | https://step-school-kids-web.onrender.com |
| Dashboard | https://dashboard.render.com/web/srv-daj6puuk1f9s73cg8r8g |
| Region / plan | Frankfurt / free |
| Build | `cd web && npm ci && npm run build` |
| Start | `cd web && npm run start` |
| Env | `NODE_VERSION=22` (+ the two lead vars from §3 when ready) |
| Branch | `claude/nifty-dirac-l9jacn` until the PR is merged → then switch to `main` (*Settings → Build & Deploy → Branch*) |

Auto-deploy is on: every push to the configured branch redeploys the site.

### Re-creating from the Blueprint (only if the service is ever deleted)

`render.yaml` at the repository root also describes the service:

```yaml
- type: web
  name: step-school-kids-web
  runtime: node
  rootDir: web
  buildCommand: npm ci && npm run build
  startCommand: npm run start
  healthCheckPath: /
```

Render dashboard → **New → Blueprint** → repository `stepschoolkids-boop/step-school` → branch `main` → approve only the web service (the bot already exists) → fill the `sync: false` env vars.

### Connecting stepschoolkids.uz

1. Dashboard → `step-school-kids-web` → **Settings → Custom Domains → Add Custom Domain** → enter `stepschoolkids.uz`. Render automatically adds `www.stepschoolkids.uz` as well (it redirects to the apex).
2. Render shows the exact DNS records. At the time of writing they are:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `216.24.57.1` |
   | CNAME | `www` | `step-school-kids-web.onrender.com` |

3. Create those two records at the registrar / DNS provider of `stepschoolkids.uz` (a `.uz` domain is usually managed at the registrar's panel or in Cloudflare). Remove any old A/CNAME records for `@` and `www` first.
4. Wait for propagation (minutes to a few hours), then press **Verify** in Render. A TLS certificate is issued automatically and the site answers on https://stepschoolkids.uz.
5. Run the §4 checklist against the real domain.

Notes: the `free` plan sleeps after inactivity, which adds a cold-start delay for the first visitor.
For a marketing site receiving paid Instagram/Telegram traffic, use the `starter` plan (change `plan:` in `render.yaml`).

## 2. Option B — Vercel

1. Vercel → **Add New → Project** → import `stepschoolkids-boop/step-school`.
2. **Root Directory**: `web`. Framework preset is detected as Next.js; Node 22 is picked up from `.nvmrc`.
3. Add the env vars from §3 → Deploy.
4. *Settings → Domains* → add `stepschoolkids.uz` (redirect `www` → apex). Records shown by Vercel; at the time of writing:

   | Type | Name | Value |
   |---|---|---|
   | A | `@` | `76.76.21.21` |
   | CNAME | `www` | `cname.vercel-dns.com` |

Always copy the values from the provider dashboard rather than from this file.

## 3. Trial-lesson leads (env vars)

`src/app/api/trial/route.ts` forwards each lead as a Telegram message when both variables exist:

| Variable | Value |
|---|---|
| `TRIAL_TELEGRAM_BOT_TOKEN` | Token of a bot that is a member of the receiving chat. The school's existing bot token (`TELEGRAM_BOT_TOKEN` of the Step Multilevel bot) can be reused. |
| `TRIAL_TELEGRAM_CHAT_ID` | Chat that receives leads — e.g. the admin's ID (`ADMIN_CHAT_ID`) or a private "Leads" group the bot was added to. |

Without them the endpoint answers `503 NOT_CONFIGURED` and the form offers the phone number and Telegram link instead. Nothing is ever pretended to be sent.

## 4. Post-deploy checks

- [ ] `/` renders; no console errors; no horizontal scroll at 320–430 px.
- [ ] `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/icon.svg`, `/opengraph-image` return 200.
- [ ] Share the URL in Telegram — the OG card shows the STEP SCHOOL KIDS image and Uzbek title.
- [ ] Submit the trial form once with a real phone → the lead arrives in Telegram (or the fallback appears if §3 is not configured).
- [ ] `tel:` and `t.me` links open correctly on a phone.
- [ ] Lighthouse (mobile): Performance ≥ 90, Accessibility ≥ 95, SEO 100.

## 5. Changing content later

Everything editable lives in `src/content/*.ts`. Push to `main` → the provider redeploys automatically.
