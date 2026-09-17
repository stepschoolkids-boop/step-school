/**
 * Server-only delivery of trial-lesson leads to the school's Telegram admins.
 *
 * Reads two server-side environment variables (never shipped to the browser):
 *   TELEGRAM_BOT_TOKEN   token of a bot that every admin has started (or that is in the group)
 *   TELEGRAM_CHAT_IDS    comma-separated chat ids that all receive every lead,
 *                        e.g. "5810421271,5253204301" (user ids, or negative group ids)
 *
 * TELEGRAM_CHAT_ID (single id, the previous name) is still honoured as a fallback when
 * TELEGRAM_CHAT_IDS is unset, so an existing deployment keeps working until it is renamed.
 *
 * Only import this module from server code (route handlers, server actions).
 */

export type TelegramLead = {
  childName: string;
  childAge: string;
  parentPhone: string;
  preferredTime: string;
};

/** Thrown when Telegram did not accept a message. Never contains the bot token. */
export class TelegramSendError extends Error {
  readonly chatId: string | null;
  readonly status: number | null;
  readonly description: string | null;

  constructor(message: string, chatId: string | null = null, status: number | null = null, description: string | null = null) {
    super(message);
    this.name = "TelegramSendError";
    this.chatId = chatId;
    this.status = status;
    this.description = description;
  }
}

/** Outcome of one lead: which admins got it and, for the rest, why not (token-free). */
export type TelegramDelivery = {
  delivered: string[];
  failed: { chatId: string; reason: string }[];
};

const TELEGRAM_API_BASE = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";
const REQUEST_TIMEOUT_MS = 10_000;
/** Numeric chat id (users are positive, groups/channels negative) or a public @username. */
const CHAT_ID_RE = /^(-?\d{1,20}|@[A-Za-z][A-Za-z0-9_]{4,31})$/;

/**
 * Parse a comma-separated list of chat ids: trims whitespace, drops empties and duplicates,
 * and rejects anything that is not a Telegram chat id so a typo can never turn into a request.
 */
export function parseChatIds(raw: string | undefined | null): { ids: string[]; invalid: string[] } {
  const ids: string[] = [];
  const invalid: string[] = [];
  for (const part of (raw ?? "").split(/[,\n;]/)) {
    const id = part.trim();
    if (!id) continue;
    if (!CHAT_ID_RE.test(id)) invalid.push(id);
    else if (!ids.includes(id)) ids.push(id);
  }
  return { ids, invalid };
}

let warnedInvalid = "";

/** Configured recipient chat ids (validated). Invalid entries are skipped and logged once. */
export function getChatIds(): string[] {
  const raw = process.env.TELEGRAM_CHAT_IDS ?? process.env.TELEGRAM_CHAT_ID;
  const { ids, invalid } = parseChatIds(raw);
  if (invalid.length && warnedInvalid !== invalid.join(",")) {
    warnedInvalid = invalid.join(",");
    console.warn(`[telegram] Ignoring invalid chat id(s) in TELEGRAM_CHAT_IDS: ${invalid.map((v) => JSON.stringify(v)).join(", ")}`);
  }
  return ids;
}

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN) && getChatIds().length > 0;
}

/** The exact plain-text message every admin receives. */
export function formatLeadMessage(lead: TelegramLead): string {
  return [
    "🆕 YANGI SINOV DARSI ARIZASI",
    "",
    `👤 Farzand: ${lead.childName}`,
    `🎂 Yoshi: ${lead.childAge}`,
    `📞 Telefon: ${lead.parentPhone}`,
    `🕐 Qulay vaqt: ${lead.preferredTime}`,
    "",
    "🌐 Manba: stepschoolkids.uz",
  ].join("\n");
}

/** Make sure a token can never leak into logs, even through a wrapped network error. */
function redact(text: string, token: string): string {
  return token ? text.split(token).join("[token]") : text;
}

/** Send one message to one chat. Resolves on Telegram's confirmation, otherwise throws a token-free error. */
async function sendMessage(token: string, chatId: string, text: string): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string } })?.cause?.code;
    const reason = err instanceof Error ? err.message : String(err);
    throw new TelegramSendError(`network error: ${redact(cause ? `${reason} (${cause})` : reason, token)}`, chatId);
  }

  const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string; error_code?: number } | null;
  if (!res.ok || !data?.ok) {
    const description = data?.description ? redact(data.description, token) : null;
    throw new TelegramSendError(`telegram http ${res.status}${description ? `: ${description}` : ""}`, chatId, res.status, description);
  }
}

/**
 * Send one lead to every configured admin chat, in parallel, with the same message.
 * Resolves with the per-chat outcome as soon as all attempts settle; a lead counts as
 * delivered when at least one admin received it. Throws only when nothing is configured
 * or every chat failed, so the parent is asked to retry only if no admin got the application.
 */
export async function sendTelegramLead(lead: TelegramLead): Promise<TelegramDelivery> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getChatIds();
  if (!token || chatIds.length === 0) throw new TelegramSendError("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_IDS not configured");

  const text = formatLeadMessage(lead);
  const results = await Promise.allSettled(chatIds.map((chatId) => sendMessage(token, chatId, text)));

  const delivery: TelegramDelivery = { delivered: [], failed: [] };
  results.forEach((r, i) => {
    if (r.status === "fulfilled") delivery.delivered.push(chatIds[i]);
    else delivery.failed.push({ chatId: chatIds[i], reason: r.reason instanceof Error ? r.reason.message : String(r.reason) });
  });

  if (delivery.delivered.length === 0) {
    throw new TelegramSendError(`all ${chatIds.length} chat(s) failed: ${delivery.failed.map((f) => `${f.chatId} → ${f.reason}`).join("; ")}`);
  }
  return delivery;
}
