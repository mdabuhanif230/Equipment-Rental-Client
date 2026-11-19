import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  children?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  children,
}: SectionHeadingProps) {
  const centered = align === "center";
  return (
    <Reveal className={`flex flex-col gap-4 ${centered ? "items-center text-center" : "items-start"}`}>
      <span className="eyebrow">
        <span className="bg-primary size-1.5 rounded-full" />
        {eyebrow}
      </span>
      <h2 className="section-title max-w-3xl">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
      {children}
    </Reveal>
  );
}
