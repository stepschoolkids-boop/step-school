import type { ReactNode } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  id?: string;
};

export function SectionHeading({ eyebrow, title, text, align = "left", tone = "light", id }: Props) {
  const center = align === "center";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className={`eyebrow ${tone === "dark" ? "text-sun" : ""} ${center ? "justify-center" : ""}`}>
          <Footprint className="size-3.5 fill-current" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2
          id={id}
          className={`headline mt-4 text-balance text-[clamp(2rem,5.2vw,3.4rem)] ${tone === "dark" ? "text-white" : "text-ink"}`}
        >
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={0.12}>
          <p className={`mt-5 text-pretty text-[1.05rem] leading-relaxed sm:text-lg ${tone === "dark" ? "text-white/75" : "text-ink-soft"}`}>
            {text}
          </p>
        </Reveal>
      )}
    </div>
  );
}
