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
