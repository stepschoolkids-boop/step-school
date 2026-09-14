/**
 * STEP SCHOOL KIDS — site-wide facts and contact data.
 *
 * RULE: nothing in this file may be invented. Every value is either
 *   • verified business information supplied by the school, or
 *   • `null` (rendered as an honest placeholder / hidden in the UI).
 *
 * Fill the `null` fields when the real data is confirmed. The UI renders
 * a field only when it has a value, so nothing fake ever ships.
 */

export const SITE = {
  name: "STEP SCHOOL KIDS",
  shortName: "Step School Kids",
  domain: "stepschoolkids.uz",
  url: "https://stepschoolkids.uz",
  /** Secondary brand element only — never the main value proposition. */
  motto: "Step Into Your Dreams!",
  tagline: "7–12 yoshdagi bolalar uchun ingliz tili",
  description:
    "STEP SCHOOL KIDS — 7–12 yoshdagi bolalar uchun ingliz tili maktabi. Riko dinozavr bilan 4 kitob, 1 yil, 156 dars: birinchi so‘zlardan erkin ingliz tiliga qadam-baqadam.",
  locale: "uz-UZ",
  countryCode: "UZ",
} as const;

/** Verified numbers supplied by the school. */
export const FACTS = {
  students: 150,
  activeGroups: 13,
  /** Capacity for new groups right now (verified). */
  openGroupCapacity: 6,
  ageFrom: 7,
  ageTo: 12,
  lessonMinutes: 90,
  books: 4,
  years: 1,
  lessons: 156,
} as const;

export type ContactInfo = {
  /** Official STEP SCHOOL KIDS phone — CONFIRMED by the school (14 Sept 2026). */
  phone: string | null;
  /** Primary admin Telegram — CONFIRMED by the school. */
  telegramUsername: string | null;
  /** Second official Telegram (school channel/account) — CONFIRMED by the school. Shown alongside the primary. */
  telegramSecondary: string | null;
  /** Official Instagram profile URL — CONFIRMED by the school. */
  instagramUrl: string | null;
  /** Instagram handle shown next to the Instagram icon (without @). */
  instagramUsername: string | null;
  /** TODO: verified street address. Keep `null` until confirmed — never guess. */
  address: string | null;
  /** TODO: Google/Yandex maps embed URL for the verified address. */
  mapEmbedUrl: string | null;
  /** TODO: e.g. "Du–Sha 09:00–19:00". */
  workingHours: string | null;
  /** TODO: path under /public to a real photo of the entrance. */
  entrancePhoto: string | null;
  /** TODO: verified landmark / how-to-find-us text. */
  landmark: string | null;
};

export const CONTACT: ContactInfo = {
  phone: "+998 99 141 49 48",
  telegramUsername: "Stepschooladmin_Muslima",
  telegramSecondary: "stepschool_kids",
  instagramUrl: "https://www.instagram.com/stepschool.kids",
  instagramUsername: "stepschool.kids",
  address: null,
  mapEmbedUrl: null,
  workingHours: null,
  entrancePhoto: null,
  landmark: null,
};

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
export const telegramHref = (username: string) => `https://t.me/${username.replace(/^@/, "")}`;

/**
 * Response-time promise shown after the trial form is submitted.
 * The "within 1 hour" statement is NOT verified yet — keep `null`
 * and the UI falls back to "Tez orada siz bilan bog‘lanamiz".
 * Example once approved: "1 soat ichida siz bilan bog‘lanamiz."
 */
export const RESPONSE_PROMISE: string | null = null;
