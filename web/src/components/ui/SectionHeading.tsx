import type { ReactNode } from "react";
import { Footprint } from "@/components/brand/Footprint";
import { Reveal } from "./Reveal";

type Props = {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  align?: "left" | "center";
  id?: string;
  size?: "md" | "lg";
};

export function SectionHeading({ eyebrow, title, text, align = "left", id, size = "md" }: Props) {
  const center = align === "center";
  return (
    <div className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <Reveal>
        <p className={`eyebrow ${center ? "justify-center" : ""}`}>
          <Footprint className="size-3 fill-current" />
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.06}>
        <h2 id={id} className={`headline mt-5 text-balance text-ink ${size === "lg" ? "text-[clamp(2.2rem,6vw,4.4rem)]" : "text-[clamp(1.9rem,4.6vw,3.2rem)]"}`}>
          {title}
        </h2>
      </Reveal>
      {text && (
        <Reveal delay={0.12}>
          <p className="mt-5 max-w-xl text-pretty text-[1.02rem] leading-relaxed text-ink/65 sm:text-lg">{text}</p>
        </Reveal>
      )}
    </div>
  );
}
