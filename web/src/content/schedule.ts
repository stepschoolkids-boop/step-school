/**
 * Schedule & pricing data.
 *
 * NOTHING here is invented. `GROUPS` is empty until the school provides real
 * group schedules and prices; the UI then shows an honest "so‘rov bo‘yicha"
 * state built only from verified facts.
 *
 * Fill in the structures below to light up the full table automatically.
 */

export type GroupSlot = {
  /** e.g. "7–9 yosh" */
  age: string;
  /** e.g. "Kids 1 · Start, Riko!" */
  group: string;
  /** e.g. "Du · Cho · Ju" */
  days: string;
  /** e.g. "15:00 – 16:30" */
  time: string;
  /** Verified remaining places. Omit unless the school confirms it right now. */
  placesLeft?: number;
};

export type PriceInfo = {
  /** e.g. "590 000 so‘m" */
  monthly: string;
  /** e.g. "oyiga · 12 dars" */
  monthlyNote: string;
  /** e.g. ["Haftada 3 dars", "Har dars 90 daqiqa", "O‘quv materiallari"] */
  included: string[];
  /** e.g. "Kitob narxi: 120 000 so‘m" */
  bookCost: string | null;
  /** e.g. "Naqd, karta yoki Click/Payme" */
  payment: string | null;
};

export const GROUPS: GroupSlot[] = [];

/** Monthly tuition — CONFIRMED by the school (14 Sept 2026). */
export const PRICE: PriceInfo | null = {
  monthly: "450 000 so‘m",
  monthlyNote: "/ oy",
  included: [],
  bookCost: null,
  payment: null,
};
