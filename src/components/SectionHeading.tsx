import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  /** Use "h1" for the primary heading of pages that have no other h1 (about, contact). */
  level?: "h1" | "h2";
  children?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  level = "h2",
  children,
}: SectionHeadingProps) {
  const centered = align === "center";
  const Heading = level;
  return (
    <Reveal className={`flex flex-col gap-4 ${centered ? "items-center text-center" : "items-start"}`}>
      <span className="eyebrow">
        <span className="bg-primary size-1.5 rounded-full" />
        {eyebrow}
      </span>
      <Heading className="section-title max-w-3xl">{title}</Heading>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      {children}
    </Reveal>
  );
}
