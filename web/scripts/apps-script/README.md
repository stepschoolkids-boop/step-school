# Leads → Google Sheets (Apps Script Web App)

Two-minute setup, no Google Cloud project needed.

1. Create a Google Sheet (e.g. "STEP SCHOOL KIDS — Arizalar"). The script creates the `Arizalar` tab and headers on first submission.
2. Extensions → Apps Script. Replace the default code with `Code.gs` from this folder. Save.
3. Project Settings (gear) → Script properties → Add property: `SECRET` = a long random string
   (e.g. run `openssl rand -hex 32`). Keep it; you'll paste the same value into Render.
4. Deploy → New deployment → type **Web app** → Execute as **Me** → Who has access **Anyone** → Deploy.
   Authorise when prompted. Copy the **Web app URL** (ends in `/exec`).
5. In Render (service `step-school-kids-web`) → Environment, add:
   - `SHEETS_WEBAPP_URL` = the `/exec` URL
   - `SHEETS_WEBAPP_SECRET` = the same secret
   Save; Render redeploys automatically.
6. Submit the form once on the live site. A row appears in `Arizalar` with the Tashkent timestamp.

Notes
- "Anyone" is required for the server to call the script without a Google login; the secret is what
  protects it, and the URL is only ever used server-side (`src/app/api/trial/route.ts`).
- Re-deploying the script after edits: Deploy → Manage deployments → edit → New version.
- Telegram forwarding (`TRIAL_TELEGRAM_*`) still works alongside; the Sheet is the source of truth.
