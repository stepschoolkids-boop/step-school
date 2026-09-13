export type LessonStage = {
  title: string;
  text: string;
  icon: "wave" | "words" | "riko" | "speak" | "read" | "move" | "practice" | "flag";
  /** Movement break — visually emphasised because it is a Kids-specific feature. */
  movement?: boolean;
};

/**
 * Structure of a 90-minute Kids lesson.
 * Only the total duration (90 min) is verified — no per-stage timings are shown.
 */
export const LESSON_STAGES: LessonStage[] = [
  { icon: "wave", title: "Salomlashuv va qizish", text: "Bolalar ingliz tiliga «kirishadi»: qisqa suhbat, o‘tgan darsni eslash." },
  { icon: "words", title: "Yangi so‘zlar", text: "Rasm, harakat va takrorlash orqali yangi so‘zlar." },
  { icon: "riko", title: "Riko bilan grammatika", text: "Qoida — ikki qahramon dialogida, ostida o‘zbekcha izoh." },
  { icon: "speak", title: "Gapirish", text: "Juftlikda va guruhda: bola o‘rganganini darhol ishlatadi." },
  { icon: "read", title: "O‘qish", text: "Tanish so‘zlardan tuzilgan hikoya — bola o‘zi o‘qiydi." },
  { icon: "move", title: "Harakatli tanaffus va o‘yin", text: "Bolalar o‘rnidan turadi, harakat qiladi, o‘yin o‘ynaydi. Diqqat qaytadi.", movement: true },
  { icon: "practice", title: "Mustahkamlash", text: "«Rikoning xatosi», boshqotirma yoki so‘z o‘yini — bilim o‘tiradi." },
  { icon: "flag", title: "Yakun", text: "Bugun nimani o‘rgandik? Kichik g‘alaba bilan uyga." },
];
