import { NextResponse } from "next/server";
import { isTelegramConfigured, sendTelegramLead } from "@/lib/telegram";

/**
 * Trial-lesson lead endpoint: validates the form and forwards every accepted
 * application to every Telegram admin chat (see src/lib/telegram.ts).
 *
 *   TELEGRAM_BOT_TOKEN   bot that every admin has started
 *   TELEGRAM_CHAT_IDS    comma-separated chat ids that all receive each lead
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
const IN_PROGRESS_ERROR = "Arizangiz yuborilmoqda. Bir necha soniyadan so‘ng qayta urinib ko‘ring.";

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

/**
 * Idempotency. The browser generates one submission id per filled form and re-uses it
 * when it retries, so a retry after a network hiccup must not reach the admins twice.
 * Recently handled ids are kept in memory for a short window; the site runs as a single
 * instance, so this is sufficient and needs no external store.
 */
const RECENT_TTL_MS = 10 * 60 * 1000;
const RECENT_MAX = 1000;
const recent = new Map<string, { state: "pending" | "sent"; at: number }>();

function pruneRecent(now: number) {
  for (const [id, entry] of recent) {
    if (now - entry.at > RECENT_TTL_MS) recent.delete(id);
  }
  while (recent.size > RECENT_MAX) {
    const oldest = recent.keys().next().value;
    if (oldest === undefined) break;
    recent.delete(oldest);
  }
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

  if (!isTelegramConfigured()) {
    console.warn("[trial] Lead received but TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_IDS is not configured.");
    return NextResponse.json(
      { ok: false, code: "NOT_CONFIGURED", error: "Onlayn qabul hozircha ulanmagan. Iltimos, qo‘ng‘iroq qiling yoki Telegramda yozing." },
      { status: 503 },
    );
  }

  const now = Date.now();
  pruneRecent(now);
  const seen = recent.get(lead.id);
  if (seen?.state === "sent") return NextResponse.json({ ok: true, duplicate: true });
  if (seen?.state === "pending") return NextResponse.json({ ok: false, error: IN_PROGRESS_ERROR }, { status: 409 });
  recent.set(lead.id, { state: "pending", at: now });

  try {
    const delivery = await sendTelegramLead({
      childName: lead.childName,
      childAge: ageLabel(lead.childAge),
      parentPhone: lead.parentPhone,
      preferredTime: TIMES[lead.preferredTime],
    });
    // At least one admin has the lead. Any chat that failed is logged (token-free) but does not block the parent.
    for (const f of delivery.failed) console.error(`[trial] telegram send to chat ${f.chatId} failed:`, f.reason);
  } catch (err) {
    recent.delete(lead.id); // let the parent retry
    console.error("[trial] telegram send failed:", err instanceof Error ? err.message : String(err));
    return NextResponse.json({ ok: false, error: RETRY_ERROR }, { status: 502 });
  }

  recent.set(lead.id, { state: "sent", at: Date.now() });
  return NextResponse.json({ ok: true });
}
