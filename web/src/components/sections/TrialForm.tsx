"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { Riko } from "@/components/brand/Riko";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { CTA } from "@/content/nav";
import { CONTACT, FACTS, RESPONSE_PROMISE, telHref, telegramHref } from "@/content/site";
import { EASE_OUT_EXPO } from "@/lib/motion";

type Status = "idle" | "loading" | "success" | "error";
type Errors = Partial<Record<"childName" | "childAge" | "parentPhone" | "preferredTime", string>>;

const AGES = Array.from({ length: FACTS.ageTo - FACTS.ageFrom + 1 }, (_, i) => String(FACTS.ageFrom + i));
const TIMES = [
  { v: "ertalab", l: "Ertalab" },
  { v: "kunduzi", l: "Kunduzi" },
  { v: "kechqurun", l: "Kechqurun" },
  { v: "farqi-yoq", l: "Farqi yo‘q" },
];

/** Formats digits into "+998 XX XXX XX XX" as the parent types. */
function formatPhone(raw: string): string {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("998")) d = d.slice(3);
  d = d.slice(0, 9);
  const parts = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean);
  return "+998" + (parts.length ? " " + parts.join(" ") : " ");
}

const inputCls =
  "h-13 w-full rounded-2xl border border-white/15 bg-white/[0.06] px-4 text-[1rem] text-white placeholder:text-white/35 transition-colors focus:border-green focus:bg-white/[0.08] focus:outline-none aria-[invalid=true]:border-[#ff9a7a]";

/**
 * Trial-lesson form. Posts to /api/trial (Telegram forwarding when configured);
 * otherwise shows an honest fallback with the verified phone and Telegram contact.
 */
export function TrialForm() {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [phone, setPhone] = useState("+998 ");
  const [time, setTime] = useState("");

  const validate = (fd: FormData): Errors => {
    const e: Errors = {};
    if (String(fd.get("childName") ?? "").trim().length < 2) e.childName = "Farzandingiz ismini kiriting.";
    if (!fd.get("childAge")) e.childAge = "Yoshni tanlang.";
    if (!/^\+998\d{9}$/.test(phone.replace(/\s/g, ""))) e.parentPhone = "To‘liq raqam kiriting: +998 XX XXX XX XX";
    if (!time) e.preferredTime = "Qulay vaqtni tanlang.";
    return e;
  };

  const onSubmit = async (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const form = ev.currentTarget;
    const fd = new FormData(form);
    const e = validate(fd);
    setErrors(e);
    if (Object.keys(e).length) {
      form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      return;
    }
    setStatus("loading");
    setServerError(null);
    setNotConfigured(false);
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childName: fd.get("childName"), childAge: fd.get("childAge"), parentPhone: phone.replace(/\s/g, ""), preferredTime: time }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; code?: string };
      if (res.ok && data.ok) {
        setStatus("success");
        form.reset();
        setPhone("+998 ");
        setTime("");
      } else {
        setNotConfigured(data.code === "NOT_CONFIGURED");
        setServerError(data.error ?? "Yuborishda xatolik. Qayta urinib ko‘ring.");
        setStatus("error");
      }
    } catch {
      setServerError("Internet bilan bog‘lanishda xatolik. Qayta urinib ko‘ring.");
      setStatus("error");
    }
  };

  return (
    <div className="glass-strong relative overflow-hidden rounded-[var(--radius-2xl)] p-6 sm:p-9">
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            role="status"
            aria-live="polite"
            className="flex min-h-[420px] flex-col items-center justify-center text-center"
          >
            <div className="relative">
              <span className="absolute inset-0 -z-10 scale-125 rounded-full bg-green/20 blur-xl" aria-hidden="true" />
              <Riko animated className="w-40" />
            </div>
            <h3 className="headline mt-6 text-3xl text-white">Qabul qilindi!</h3>
            <p className="mt-3 max-w-sm text-white/70">{RESPONSE_PROMISE ?? "Tez orada siz bilan bog‘lanamiz."}</p>
            <p className="mt-1 text-sm text-white/45">Riko sizni sinov darsida kutadi.</p>
            <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm font-bold text-green underline-offset-4 hover:underline">
              Yana bir ariza qoldirish
            </button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={onSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5" aria-describedby={`${id}-hint`}>
            <div className="grid gap-5 sm:grid-cols-[1fr_150px]">
              <div>
                <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-bold text-white/85">
                  Farzandingiz ismi
                </label>
                <input id={`${id}-name`} name="childName" type="text" autoComplete="off" placeholder="Masalan, Aziza" className={inputCls} aria-invalid={!!errors.childName} aria-describedby={errors.childName ? `${id}-name-err` : undefined} />
                {errors.childName && <p id={`${id}-name-err`} className="mt-1.5 text-sm font-semibold text-[#ff9a7a]">{errors.childName}</p>}
              </div>
              <div>
                <label htmlFor={`${id}-age`} className="mb-1.5 block text-sm font-bold text-white/85">
                  Yoshi
                </label>
                <select
                  id={`${id}-age`}
                  name="childAge"
                  defaultValue=""
                  className={`${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23f5f8ff' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[position:right_1rem_center] bg-no-repeat pr-10 [&>option]:bg-navy-900 [&>option]:text-white`}
                  aria-invalid={!!errors.childAge}
                  aria-describedby={errors.childAge ? `${id}-age-err` : undefined}
                >
                  <option value="" disabled>
                    Tanlang
                  </option>
                  {AGES.map((a) => (
                    <option key={a} value={a}>
                      {a} yosh
                    </option>
                  ))}
                  <option value="boshqa">Boshqa</option>
                </select>
                {errors.childAge && <p id={`${id}-age-err`} className="mt-1.5 text-sm font-semibold text-[#ff9a7a]">{errors.childAge}</p>}
              </div>
            </div>

            <div>
              <label htmlFor={`${id}-phone`} className="mb-1.5 block text-sm font-bold text-white/85">
                Ota-onaning telefon raqami
              </label>
              <input
                id={`${id}-phone`}
                name="parentPhone"
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                onFocus={(e) => e.target.setSelectionRange(e.target.value.length, e.target.value.length)}
                className={inputCls}
                aria-invalid={!!errors.parentPhone}
                aria-describedby={errors.parentPhone ? `${id}-phone-err` : undefined}
              />
              {errors.parentPhone && <p id={`${id}-phone-err`} className="mt-1.5 text-sm font-semibold text-[#ff9a7a]">{errors.parentPhone}</p>}
            </div>

            <fieldset>
              <legend className="mb-1.5 block text-sm font-bold text-white/85">Qo‘ng‘iroq uchun qulay vaqt</legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-invalid={!!errors.preferredTime}>
                {TIMES.map((t) => {
                  const checked = time === t.v;
                  return (
                    <label
                      key={t.v}
                      className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl border text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-blue-light ${
                        checked ? "border-green bg-green/15 text-green" : "border-white/12 bg-white/[0.04] text-white/70 hover:border-white/30"
                      }`}
                    >
                      <input type="radio" name="preferredTime" value={t.v} checked={checked} onChange={() => setTime(t.v)} className="sr-only" />
                      {t.l}
                    </label>
                  );
                })}
              </div>
              {errors.preferredTime && <p className="mt-1.5 text-sm font-semibold text-[#ff9a7a]">{errors.preferredTime}</p>}
            </fieldset>

            {status === "error" && serverError && (
              <div role="alert" className="rounded-2xl border border-[#ff9a7a]/40 bg-[#ff9a7a]/10 p-4 text-sm text-white">
                <p className="font-bold text-[#ffb59e]">{serverError}</p>
                {notConfigured && (CONTACT.phone || CONTACT.telegramUsername) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {CONTACT.phone && (
                      <a href={telHref(CONTACT.phone)} className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 font-bold text-navy-950">
                        <Icon name="phone" className="size-4" /> {CONTACT.phone}
                      </a>
                    )}
                    {CONTACT.telegramUsername && (
                      <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-white/25 px-4 font-bold">
                        <Icon name="telegram" className="size-4 text-blue-light" /> @{CONTACT.telegramUsername}
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            <Button type="submit" size="lg" disabled={status === "loading"} className="mt-1 w-full">
              {status === "loading" ? (
                <>
                  <span className="size-5 animate-spin rounded-full border-[3px] border-navy-950/30 border-t-navy-950" aria-hidden="true" />
                  Yuborilmoqda…
                </>
              ) : (
                <>
                  {CTA.full} <Icon name="arrow" className="size-5" />
                </>
              )}
            </Button>
            <p id={`${id}-hint`} className="text-center text-xs text-white/40">
              Raqamingiz faqat sinov darsini kelishish uchun ishlatiladi.
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
