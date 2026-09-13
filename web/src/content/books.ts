export type BookTone = "green" | "sky" | "sun" | "coral";

export type Book = {
  step: number;
  /** Product name — stays in English by brand decision. */
  title: string;
  /** Uzbek concept line shown to parents. */
  concept: string;
  /** English concept as used in the school's material. */
  conceptEn: string;
  /** One-sentence promise in Uzbek. */
  promise: string;
  tone: BookTone;
  /**
   * Path under /public to the real cover (e.g. "/books/start-riko.jpg").
   * `null` renders the generated brand cover. Drop real artwork in and set the path.
   */
  cover: string | null;
};

export const BOOKS: Book[] = [
  {
    step: 1,
    title: "Start, Riko!",
    concept: "Birinchi so‘zlar",
    conceptEn: "First words",
    promise: "Bola ingliz tilidagi birinchi so‘zlarini o‘rganadi va ulardan qo‘rqmay foydalanishni boshlaydi.",
    tone: "green",
    cover: null,
  },
  {
    step: 2,
    title: "Speak, Riko!",
    concept: "Birinchi gaplar",
    conceptEn: "First sentences",
    promise: "So‘zlar gapga aylanadi: bola o‘zi haqida, oilasi va kuni haqida gapira boshlaydi.",
    tone: "sky",
    cover: null,
  },
  {
    step: 3,
    title: "Read, Riko!",
    concept: "Birinchi hikoyalar",
    conceptEn: "First stories",
    promise: "Bola o‘rgangan so‘zlaridan tuzilgan hikoyalarni o‘zi o‘qiydi va tushunadi.",
    tone: "sun",
    cover: null,
  },
  {
    step: 4,
    title: "Win, Riko!",
    concept: "Ingliz tiliga tayyor",
    conceptEn: "Ready for English",
    promise: "Bir yillik yo‘l yakunida bola ingliz tilida ishonch bilan gapiradi, o‘qiydi va tushunadi.",
    tone: "coral",
    cover: null,
  },
];

export type BookFeature = {
  title: string;
  text: string;
  icon: "dialog" | "uz" | "mistake" | "story" | "words" | "game" | "colour" | "puzzle" | "scene" | "box" | "parent" | "riko";
  /** Verified numeric badge, e.g. "12". */
  badge?: string;
};

/** Verified differentiators of the STEP SCHOOL KIDS books. */
export const BOOK_FEATURES: BookFeature[] = [
  { icon: "riko", title: "Riko grammatikani o‘rgatadi", text: "Qoidalar quruq jadval emas — Riko ularni bolaga o‘z tilida tushuntiradi." },
  { icon: "dialog", title: "Ikki qahramon dialogi", text: "Har bir grammatika qoidasi ikki qahramon suhbati orqali ochib beriladi." },
  { icon: "uz", title: "O‘zbekcha izohlar", text: "Har bir qoida ostida o‘zbekcha tushuntirish bor — bola yolg‘iz qolmaydi." },
  { icon: "mistake", title: "«Rikoning xatosi»", text: "Har darsda Riko xato qiladi, bola esa uni to‘g‘rilaydi. Eng kuchli mustahkamlash usuli." },
  { icon: "story", title: "Har darsda hikoya", text: "Har bir dars o‘qish uchun hikoya bilan tugaydi." },
  { icon: "words", title: "Tanish so‘zlardan hikoyalar", text: "Hikoyalar faqat o‘rganilgan so‘zlardan tuziladi — bola ularni o‘zi o‘qiy oladi." },
  { icon: "game", title: "So‘z o‘yinlari", text: "Yangi so‘zlar o‘yin orqali eslab qolinadi." },
  { icon: "colour", title: "Bo‘yash sahifalari", text: "Qo‘l bilan ishlash — 7–12 yoshdagi bola uchun tabiiy o‘rganish yo‘li." },
  { icon: "puzzle", title: "Boshqotirmalar", text: "Mantiq va ingliz tili birga ishlaydi.", badge: "12" },
  { icon: "scene", title: "To‘liq sahifali sahnalar", text: "Katta illyustratsiyalar so‘zlarni kontekstda o‘rgatadi.", badge: "6" },
  { icon: "box", title: "«My words» tarjima qutisi", text: "Bola o‘z so‘zlarini yozib, tarjimasini yonida saqlaydi." },
  { icon: "parent", title: "Ota-ona tekshira oladi", text: "Ingliz tilini bilmasangiz ham farzandingiz nimani o‘rganganini tekshirishingiz mumkin." },
];
