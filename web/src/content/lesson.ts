export type LessonStage = {
  /** Short English stage word used as kinetic label (brand decision). */
  key: "WELCOME" | "LEARN" | "MOVE" | "PRACTICE" | "SPEAK" | "WRAP UP";
  /** Uzbek label shown to parents. */
  title: string;
  /** One short sentence. */
  text: string;
  icon: "wave" | "words" | "move" | "practice" | "speak" | "flag";
  /** Movement break — the Kids-specific feature, visually emphasised. */
  movement?: boolean;
};

/**
 * Structure of a 90-minute Kids lesson.
 * Only the total duration (90 min) and the movement break are verified — no per-stage timings.
 */
export const LESSON_STAGES: LessonStage[] = [
  { key: "WELCOME", icon: "wave", title: "Salomlashuv", text: "Qisqa suhbat, o‘tgan darsni eslash — bola ingliz tiliga «kiradi»." },
  { key: "LEARN", icon: "words", title: "O‘rganish", text: "Yangi so‘zlar va Riko bilan grammatika — ostida o‘zbekcha izoh." },
  { key: "MOVE", icon: "move", title: "Harakat", text: "Harakatli tanaffus va o‘yin. Bolalar o‘rnidan turadi — diqqat qaytadi.", movement: true },
  { key: "PRACTICE", icon: "practice", title: "Mashq", text: "«Rikoning xatosi», so‘z o‘yinlari, boshqotirmalar — bilim o‘tiradi." },
  { key: "SPEAK", icon: "speak", title: "Gapirish", text: "Juftlikda va guruhda: bola o‘rganganini darhol ishlatadi." },
  { key: "WRAP UP", icon: "flag", title: "Yakun", text: "Bugun nimani o‘rgandik? Kichik g‘alaba bilan uyga." },
];
