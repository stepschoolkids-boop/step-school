"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Riko } from "@/components/brand/Riko";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { CTA } from "@/content/nav";
import { CONTACT, FACTS, RESPONSE_PROMISE, telHref, telegramHref } from "@/content/site";
import { EASE } from "@/lib/motion";

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
    const name = String(fd.get("childName") ?? "").trim();
    if (name.length < 2) e.childName = "Farzandingiz ismini kiriting.";
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
      const first = form.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setStatus("loading");
    setServerError(null);
    setNotConfigured(false);
    try {
      const res = await fetch("/api/trial", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          childName: fd.get("childName"),
          childAge: fd.get("childAge"),
          parentPhone: phone.replace(/\s/g, ""),
          preferredTime: time,
        }),
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

  const inputCls =
    "h-13 w-full rounded-2xl border-2 border-ink/10 bg-paper px-4 text-[1rem] text-ink placeholder:text-ink-mute focus:border-green focus:outline-none aria-[invalid=true]:border-coral";

  return (
    <section id="sinov-darsi" className="relative isolate scroll-mt-16 overflow-hidden py-20 sm:py-28" aria-labelledby="trial-title">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-x-0 top-1/3 h-2/3 bg-[linear-gradient(180deg,transparent,#fdefd6)]" />
      </div>
      <div className="container-x">
        <Reveal className="relative overflow-hidden rounded-[var(--radius-2xl)] bg-ink text-white shadow-[var(--shadow-soft)]">
          <Footprint className="pointer-events-none absolute -left-10 -bottom-12 w-64 rotate-12 fill-white/[0.04]" />
          <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
            {/* Left: copy */}
            <div className="relative p-7 sm:p-10 lg:p-14">
              <p className="eyebrow text-sun">Bepul sinov darsi</p>
              <h2 id="trial-title" className="headline mt-4 text-[clamp(2rem,5vw,3.4rem)]">
                Birinchi qadamni <span className="text-sun">bugun</span> tashlang
              </h2>
              <p className="mt-5 max-w-md text-pretty leading-relaxed text-white/75">
                Ariza qoldiring — administratorimiz siz bilan bog‘lanib, farzandingizga mos guruh va sinov darsi vaqtini kelishib oladi.
              </p>
              <ul className="mt-7 grid gap-3 text-white/85">
                {[
                  "Farzandingiz Riko va o‘qituvchi bilan tanishadi",
                  "Siz kitoblar va dasturni o‘z ko‘zingiz bilan ko‘rasiz",
                  "Hech qanday majburiyat yo‘q — qaror sizniki",
                ].map((x) => (
                  <li key={x} className="flex items-start gap-3">
                    <span className="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-green text-white">
                      <Icon name="check" className="size-3.5" />
                    </span>
                    {x}
                  </li>
                ))}
              </ul>
              {CONTACT.telegramUsername && (
                <a
                  href={telegramHref(CONTACT.telegramUsername)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-8 inline-flex h-12 items-center gap-2 rounded-full border border-white/15 px-5 font-bold transition-colors hover:bg-white/10"
                >
                  <Icon name="telegram" className="size-5 text-sky" /> Telegramda yozish
                </a>
              )}
              <Riko className="pointer-events-none absolute -bottom-6 right-4 hidden w-40 lg:block" />
            </div>

            {/* Right: form */}
            <div className="relative bg-paper p-6 text-ink sm:p-10 lg:p-14">
              <AnimatePresence mode="wait">
                {status === "success" ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: EASE }}
                    role="status"
                    aria-live="polite"
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                  >
                    <div className="anim-pop relative">
                      <span className="absolute inset-0 -z-10 scale-125 rounded-full bg-green-light" aria-hidden="true" />
                      <Riko animated className="w-40" />
                    </div>
                    <h3 className="headline mt-6 text-3xl">Qabul qilindi!</h3>
                    <p className="mt-3 max-w-sm text-ink-soft">{RESPONSE_PROMISE ?? "Tez orada siz bilan bog‘lanamiz."}</p>
                    <p className="mt-1 text-sm text-ink-mute">Riko sizni sinov darsida kutadi 🦖</p>
                    <button type="button" onClick={() => setStatus("idle")} className="mt-8 text-sm font-bold text-green-deep underline-offset-4 hover:underline">
                      Yana bir ariza qoldirish
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    noValidate
                    onSubmit={onSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid gap-5"
                    aria-describedby={`${id}-hint`}
                  >
                    <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
                      <div>
                        <label htmlFor={`${id}-name`} className="mb-1.5 block text-sm font-bold">
                          Farzandingiz ismi
                        </label>
                        <input
                          id={`${id}-name`}
                          name="childName"
                          type="text"
                          autoComplete="off"
                          placeholder="Masalan, Aziza"
                          className={inputCls}
                          aria-invalid={!!errors.childName}
                          aria-describedby={errors.childName ? `${id}-name-err` : undefined}
                        />
                        {errors.childName && <p id={`${id}-name-err`} className="mt-1.5 text-sm font-semibold text-coral-deep">{errors.childName}</p>}
                      </div>
                      <div>
                        <label htmlFor={`${id}-age`} className="mb-1.5 block text-sm font-bold">
                          Yoshi
                        </label>
                        <select
                          id={`${id}-age`}
                          name="childAge"
                          defaultValue=""
                          className={`${inputCls} appearance-none bg-[url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2314232b' stroke-width='2.5' stroke-linecap='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")] bg-[position:right_1rem_center] bg-no-repeat pr-10`}
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
                        {errors.childAge && <p id={`${id}-age-err`} className="mt-1.5 text-sm font-semibold text-coral-deep">{errors.childAge}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`${id}-phone`} className="mb-1.5 block text-sm font-bold">
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
                      {errors.parentPhone && <p id={`${id}-phone-err`} className="mt-1.5 text-sm font-semibold text-coral-deep">{errors.parentPhone}</p>}
                    </div>

                    <fieldset>
                      <legend className="mb-1.5 block text-sm font-bold">Qo‘ng‘iroq uchun qulay vaqt</legend>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-invalid={!!errors.preferredTime}>
                        {TIMES.map((t) => {
                          const checked = time === t.v;
                          return (
                            <label
                              key={t.v}
                              className={`flex h-12 cursor-pointer items-center justify-center rounded-2xl border-2 text-sm font-bold transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-sky-deep ${
                                checked ? "border-green bg-green-light text-green-deep" : "border-ink/10 bg-paper text-ink-soft hover:border-ink/30"
                              }`}
                            >
                              <input
                                type="radio"
                                name="preferredTime"
                                value={t.v}
                                checked={checked}
                                onChange={() => setTime(t.v)}
                                className="sr-only"
                              />
                              {t.l}
                            </label>
                          );
                        })}
                      </div>
                      {errors.preferredTime && <p className="mt-1.5 text-sm font-semibold text-coral-deep">{errors.preferredTime}</p>}
                    </fieldset>

                    {status === "error" && serverError && (
                      <div role="alert" className="rounded-2xl border-2 border-coral/40 bg-coral-light p-4 text-sm text-ink">
                        <p className="font-bold text-coral-deep">{serverError}</p>
                        {notConfigured && (CONTACT.phone || CONTACT.telegramUsername) && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {CONTACT.phone && (
                              <a href={telHref(CONTACT.phone)} className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-4 font-bold text-white">
                                <Icon name="phone" className="size-4" /> {CONTACT.phone}
                              </a>
                            )}
                            {CONTACT.telegramUsername && (
                              <a href={telegramHref(CONTACT.telegramUsername)} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border-2 border-ink/15 px-4 font-bold">
                                <Icon name="telegram" className="size-4 text-sky-deep" /> Telegram
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    <Button type="submit" size="lg" disabled={status === "loading"} className="mt-1 w-full">
                      {status === "loading" ? (
                        <>
                          <span className="size-5 animate-spin rounded-full border-[3px] border-white/40 border-t-white" aria-hidden="true" />
                          Yuborilmoqda…
                        </>
                      ) : (
                        <>
                          {CTA.full} <Icon name="arrow" className="size-5" />
                        </>
                      )}
                    </Button>
                    <p id={`${id}-hint`} className="text-center text-xs text-ink-mute">
                      Raqamingiz faqat sinov darsini kelishish uchun ishlatiladi.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
