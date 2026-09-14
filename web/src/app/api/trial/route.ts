import { NextResponse } from "next/server";

/**
 * Trial-lesson lead endpoint.
 *
 * Source of truth: a Google Sheet, written through an Apps Script Web App
 * (see scripts/apps-script/). Telegram is an optional second channel.
 *
 *   SHEETS_WEBAPP_URL          /exec URL of the deployed Apps Script web app
 *   SHEETS_WEBAPP_SECRET       shared secret checked by the script
 *   TRIAL_TELEGRAM_BOT_TOKEN   (optional) bot that is a member of the target chat
 *   TRIAL_TELEGRAM_CHAT_ID     (optional) chat / group id that receives leads
 *
 * With nothing configured the endpoint answers 503 and the form shows an honest
 * fallback (call / write on Telegram). Nothing is ever pretended to be "sent".
 * All secrets stay on the server; the browser only talks to this route.
 */

type Lead = { id: string; childName: string; childAge: string; parentPhone: string; preferredTime: string };

const AGES = new Set(["7", "8", "9", "10", "11", "12", "boshqa"]);
const TIMES: Record<string, string> = { ertalab: "Ertalab", kunduzi: "Kunduzi", kechqurun: "Kechqurun", "farqi-yoq": "Farqi yo‘q" };
const ageLabel = (a: string) => (a === "boshqa" ? "Boshqa" : `${a} yosh`);

const RETRY_ERROR = "Yuborishda xatolik. Iltimos, qayta urinib ko‘ring yoki qo‘ng‘iroq qiling.";

function validate(body: unknown): { ok: true; lead: Lead } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Noto‘g‘ri so‘rov." };
  const b = body as Record<string, unknown>;
  const childName = String(b.childName ?? "").trim();
  const childAge = String(b.childAge ?? "").trim();
  const parentPhone = String(b.parentPhone ?? "").replace(/[^\d+]/g, "");
  const preferredTime = String(b.preferredTime ?? "").trim();
  const rawId = String(b.id ?? "").trim();
  const id = /^[A-Za-z0-9-]{8,64}$/.test(rawId) ? rawId : crypto.randomUUID();

  if (childName.length < 2 || childName.length > 60) return { ok: false, error: "Farzandingiz ismini kiriting." };
  if (!AGES.has(childAge)) return { ok: false, error: "Yoshni tanlang." };
  if (!/^\+998\d{9}$/.test(parentPhone)) return { ok: false, error: "Telefon raqamini +998 formatida kiriting." };
  if (!(preferredTime in TIMES)) return { ok: false, error: "Qulay vaqtni tanlang." };

  return { ok: true, lead: { id, childName, childAge, parentPhone, preferredTime } };
}

/** Append one row via the Apps Script web app. Throws on any non-OK outcome. */
async function appendToSheet(lead: Lead, url: string, secret: string): Promise<void> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    redirect: "follow", // Apps Script answers with a 302 to the script content host
    body: JSON.stringify({
      secret,
      id: lead.id,
      childName: lead.childName,
      childAge: ageLabel(lead.childAge),
      parentPhone: lead.parentPhone,
      preferredTime: TIMES[lead.preferredTime],
      source: "stepschoolkids.uz",
    }),
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) throw new Error(`sheets http ${res.status}`);
  const data = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!data?.ok) throw new Error(`sheets rejected: ${data?.error ?? "no json"}`);
}

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

/** Best-effort Telegram notification. Throws on failure; callers decide whether that matters. */
async function notifyTelegram(lead: Lead, token: string, chatId: string): Promise<void> {
  const text =
    `🦖 <b>Yangi sinov darsi so‘rovi</b>\n\n` +
    `👧 Farzand: <b>${esc(lead.childName)}</b>, ${esc(ageLabel(lead.childAge))}\n` +
    `📞 Ota-ona: <code>${esc(lead.parentPhone)}</code>\n` +
    `🕒 Qulay vaqt: ${esc(TIMES[lead.preferredTime])}\n` +
    `🌐 Manba: stepschoolkids.uz`;
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`telegram ${res.status}`);
}

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto‘g‘ri so‘rov." }, { status: 400 });
  }

  const v = validate(json);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 422 });
  const { lead } = v;

  const sheetsUrl = process.env.SHEETS_WEBAPP_URL;
  const sheetsSecret = process.env.SHEETS_WEBAPP_SECRET;
  const tgToken = process.env.TRIAL_TELEGRAM_BOT_TOKEN;
  const tgChat = process.env.TRIAL_TELEGRAM_CHAT_ID;
  const sheetsOn = Boolean(sheetsUrl && sheetsSecret);
  const telegramOn = Boolean(tgToken && tgChat);

  if (!sheetsOn && !telegramOn) {
    console.warn("[trial] Lead received but neither SHEETS_WEBAPP_* nor TRIAL_TELEGRAM_* is configured.");
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", error: "Onlayn qabul hozircha ulanmagan. Iltimos, qo‘ng‘iroq qiling yoki Telegramda yozing." },
      { status: 503 },
    );
  }

  // 1) Sheet is the source of truth. If it fails, report an error so the parent can retry
  //    (the submission id makes the retry idempotent on the sheet side).
  if (sheetsOn) {
    try {
      await appendToSheet(lead, sheetsUrl!, sheetsSecret!);
    } catch (err) {
      console.error("[trial] sheets append failed:", err);
      return NextResponse.json({ ok: false, error: RETRY_ERROR }, { status: 502 });
    }
  }

  // 2) Telegram: best-effort when the sheet succeeded; decisive only when it is the sole channel.
  if (telegramOn) {
    try {
      await notifyTelegram(lead, tgToken!, tgChat!);
    } catch (err) {
      console.error("[trial] telegram notify failed:", err);
      if (!sheetsOn) return NextResponse.json({ ok: false, error: RETRY_ERROR }, { status: 502 });
    }
  }

  return NextResponse.json({ ok: true });
}
