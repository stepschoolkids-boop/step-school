"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { EASE, usePrefersReducedMotion } from "@/lib/motion";

type RevealProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  once?: boolean;
  as?: "div" | "section" | "li" | "article" | "span" | "p" | "h2" | "h3";
};

/** Scroll-triggered entrance. Falls back to a simple fade when reduced motion is on. */
export function Reveal({ delay = 0, y = 26, once = true, as = "div", children, ...rest }: RevealProps) {
  const reduced = usePrefersReducedMotion();
  const Tag = motion[as] as typeof motion.div;
  return (
    <Tag
      initial={{ opacity: 0, y: reduced ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "0px 0px -12% 0px" }}
      transition={{ duration: reduced ? 0.3 : 0.75, delay, ease: EASE }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
