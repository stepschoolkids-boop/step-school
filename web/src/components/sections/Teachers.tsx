import Image from "next/image";
import { Riko } from "@/components/brand/Riko";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CTA } from "@/content/nav";
import { TEACHERS, TEACHER_PRINCIPLE, type Teacher } from "@/content/teachers";

function TeacherCard({ t }: { t: Teacher }) {
  return (
    <article className="card overflow-hidden">
      <div className="relative aspect-[4/5] bg-green-light">
        {t.photo ? (
          <Image src={t.photo} alt={t.name} fill sizes="(max-width: 640px) 90vw, 33vw" className="object-cover" />
        ) : (
          <Riko className="absolute bottom-0 left-1/2 w-3/4 -translate-x-1/2" />
        )}
      </div>
      <div className="p-6">
        <h3 className="font-display text-xl font-semibold">{t.name}</h3>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-green-deep">{t.role}</p>
        {t.qualification && <p className="mt-3 text-sm text-ink-soft">{t.qualification}</p>}
        {t.experience && <p className="mt-1 text-sm text-ink-soft">{t.experience}</p>}
        {t.quote && <blockquote className="mt-4 border-l-4 border-sun pl-3 text-ink-soft italic">“{t.quote}”</blockquote>}
      </div>
    </article>
  );
}

export function Teachers() {
  return (
    <section id="oqituvchilar" className="relative py-20 sm:py-28" aria-labelledby="teachers-title">
      <div className="container-x">
        <SectionHeading
          eyebrow="O‘qituvchilar"
          id="teachers-title"
          title={
            <>
              Bola bilan ishlashni <span className="text-green">biladigan</span> o‘qituvchilar
            </>
          }
          text="7 yoshli bola bilan 17 yoshli o‘smir bilan ishlagandek ishlab bo‘lmaydi. Shuning uchun o‘qituvchilarimizga qo‘yiladigan talablar ham boshqacha."
        />

        {TEACHERS.length > 0 ? (
          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {TEACHERS.map((t, i) => (
              <Reveal as="li" key={t.name} delay={i * 0.08}>
                <TeacherCard t={t} />
              </Reveal>
            ))}
          </ul>
        ) : (
          /* Honest state: no invented profiles. Verified principle + invitation to meet the teacher at the trial lesson. */
          <div className="mt-14 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal className="card relative overflow-hidden p-8 sm:p-10">
              <Icon name="check" className="absolute right-8 top-8 size-10 text-green" />
              <p className="eyebrow">Bizning tamoyil</p>
              <h3 className="headline mt-4 max-w-xl text-[clamp(1.6rem,3.6vw,2.4rem)]">{TEACHER_PRINCIPLE.title}</h3>
              <p className="mt-5 max-w-xl text-pretty leading-relaxed text-ink-soft">{TEACHER_PRINCIPLE.text}</p>
            </Reveal>
            <Reveal delay={0.1} className="relative overflow-hidden rounded-[var(--radius-xl)] bg-sun p-8 text-ink sm:p-10">
              <Riko className="pointer-events-none absolute -bottom-8 -right-8 w-44 rotate-[-6deg] opacity-90" />
              <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-ink/60">Eng yaxshi tanishuv</p>
              <h3 className="headline mt-3 max-w-[14ch] text-[clamp(1.6rem,3.4vw,2.2rem)]">O‘qituvchi bilan sinov darsida tanishing</h3>
              <p className="mt-3 max-w-[26ch] text-ink/80">Farzandingiz darsda qatnashadi, siz esa o‘qituvchi bilan gaplashasiz.</p>
              <Button href={CTA.href} className="relative mt-6 bg-ink text-white shadow-none hover:bg-ink/90" variant="ghost">
                {CTA.short} <Icon name="arrow" className="size-4" />
              </Button>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
