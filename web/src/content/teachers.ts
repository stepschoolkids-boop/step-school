export type Teacher = {
  /** Path under /public, e.g. "/teachers/name.jpg" */
  photo: string | null;
  name: string;
  role: string;
  qualification?: string;
  experience?: string;
  quote?: string;
};

/**
 * Real teachers only. Empty until the school provides names, photos and
 * verified qualifications. The section renders a verified statement about
 * teacher selection in the meantime — never invented profiles.
 */
export const TEACHERS: Teacher[] = [];

/** Verified statement supplied by the school. */
export const TEACHER_PRINCIPLE = {
  title: "O‘qituvchilar bolalar bilan ishlash mezonlari bo‘yicha baholanadi",
  text: "STEP SCHOOL KIDS o‘qituvchilari aniq mezonlar asosida baholanadi. Bu mezonlar bolalarga o‘qitishning o‘ziga xos jihatlarini hisobga oladi — chunki bola bilan ishlash kattalar bilan ishlashdan farq qiladi.",
} as const;
