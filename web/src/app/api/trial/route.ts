import { NextResponse } from "next/server";

/**
 * Trial-lesson lead endpoint.
 *
 * INTEGRATION POINT — forwards the lead to a Telegram chat when both env vars
 * are configured on the server:
 *   TRIAL_TELEGRAM_BOT_TOKEN   token of a bot that is a member of the target chat
 *   TRIAL_TELEGRAM_CHAT_ID     chat / channel / group id that receives leads
 *
 * Without them the endpoint answers 503 and the form shows an honest fallback
 * (call / write on Telegram). Nothing is ever pretended to be "sent".
 */

type Lead = { childName: string; childAge: string; parentPhone: string; preferredTime: string };

const AGES = new Set(["7", "8", "9", "10", "11", "12", "boshqa"]);
const TIMES = new Set(["ertalab", "kunduzi", "kechqurun", "farqi-yoq"]);

function validate(body: unknown): { ok: true; lead: Lead } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Noto‘g‘ri so‘rov." };
  const b = body as Record<string, unknown>;
  const childName = String(b.childName ?? "").trim();
  const childAge = String(b.childAge ?? "").trim();
  const parentPhone = String(b.parentPhone ?? "").replace(/[^\d+]/g, "");
  const preferredTime = String(b.preferredTime ?? "").trim();

  if (childName.length < 2 || childName.length > 60) return { ok: false, error: "Farzandingiz ismini kiriting." };
  if (!AGES.has(childAge)) return { ok: false, error: "Yoshni tanlang." };
  if (!/^\+998\d{9}$/.test(parentPhone)) return { ok: false, error: "Telefon raqamini +998 formatida kiriting." };
  if (!TIMES.has(preferredTime)) return { ok: false, error: "Qulay vaqtni tanlang." };

  return { ok: true, lead: { childName, childAge, parentPhone, preferredTime } };
}

const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c] as string);

export async function POST(req: Request) {
  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Noto‘g‘ri so‘rov." }, { status: 400 });
  }

  const v = validate(json);
  if (!v.ok) return NextResponse.json({ ok: false, error: v.error }, { status: 422 });

  const token = process.env.TRIAL_TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TRIAL_TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn("[trial] Lead received but TRIAL_TELEGRAM_* env vars are not configured.");
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", error: "Onlayn qabul hozircha ulanmagan. Iltimos, qo‘ng‘iroq qiling yoki Telegramda yozing." },
      { status: 503 },
    );
  }

  const { lead } = v;
  const text =
    `🦖 <b>Yangi sinov darsi so‘rovi</b>\n\n` +
    `👧 Farzand: <b>${esc(lead.childName)}</b>, ${esc(lead.childAge)} yosh\n` +
    `📞 Ota-ona: <code>${esc(lead.parentPhone)}</code>\n` +
    `🕒 Qulay vaqt: ${esc(lead.preferredTime)}\n` +
    `🌐 Manba: stepschoolkids.uz`;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`telegram ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[trial] forwarding failed:", err);
    return NextResponse.json({ ok: false, error: "Yuborishda xatolik. Iltimos, qayta urinib ko‘ring yoki qo‘ng‘iroq qiling." }, { status: 502 });
  }
}
