export type NavItem = { label: string; href: string };

/**
 * Homepage anchors today. Phase-2 pages (Kitoblar, Ota-onalar uchun, Natijalar,
 * Biz haqimizda) can switch these hrefs to real routes without touching the UI.
 */
export const NAV_ITEMS: NavItem[] = [
  { label: "Kurs", href: "#kurs" },
  { label: "Kitoblar", href: "#kitoblar" },
  { label: "O‘qituvchilar", href: "#oqituvchilar" },
  { label: "Darslar", href: "#darslar" },
  { label: "Narxlar", href: "#narxlar" },
  { label: "Aloqa", href: "#aloqa" },
];

export const CTA = {
  short: "Bepul sinov darsi",
  full: "Bepul sinov darsiga yozilish",
  href: "#sinov-darsi",
} as const;
