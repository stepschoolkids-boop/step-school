/**
 * Server-only delivery of trial-lesson leads to the school's Telegram admin chat.
 *
 * Reads two server-side environment variables (never shipped to the browser):
 *   TELEGRAM_BOT_TOKEN   token of a bot that is a member of the admin chat
 *   TELEGRAM_CHAT_ID     id of the admin chat (a user id, or a negative group id)
 *
 * Only import this module from server code (route handlers, server actions).
 */

export type TelegramLead = {
  childName: string;
  childAge: string;
  parentPhone: string;
  preferredTime: string;
};

/** Thrown when Telegram did not accept the message. Never contains the bot token. */
export class TelegramSendError extends Error {
  readonly status: number | null;
  readonly description: string | null;

  constructor(message: string, status: number | null = null, description: string | null = null) {
    super(message);
    this.name = "TelegramSendError";
    this.status = status;
    this.description = description;
  }
}

const TELEGRAM_API_BASE = process.env.TELEGRAM_API_BASE || "https://api.telegram.org";
const REQUEST_TIMEOUT_MS = 10_000;

export function isTelegramConfigured(): boolean {
  return Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
}

/** The exact plain-text message the admin chat receives. */
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

/**
 * Send one lead to the configured admin chat. Resolves when Telegram confirmed delivery,
 * otherwise throws a TelegramSendError with a token-free explanation for the server log.
 */
export async function sendTelegramLead(lead: TelegramLead): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new TelegramSendError("TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not configured");

  let res: Response;
  try {
    res = await fetch(`${TELEGRAM_API_BASE}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: formatLeadMessage(lead) }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    const cause = (err as { cause?: { code?: string } })?.cause?.code;
    const reason = err instanceof Error ? err.message : String(err);
    throw new TelegramSendError(`network error: ${redact(cause ? `${reason} (${cause})` : reason, token)}`);
  }

  const data = (await res.json().catch(() => null)) as { ok?: boolean; description?: string; error_code?: number } | null;
  if (!res.ok || !data?.ok) {
    const description = data?.description ? redact(data.description, token) : null;
    throw new TelegramSendError(`telegram http ${res.status}${description ? `: ${description}` : ""}`, res.status, description);
  }
}
