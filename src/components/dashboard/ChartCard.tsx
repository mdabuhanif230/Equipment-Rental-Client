"use client";

import type { ReactNode } from "react";
import Reveal from "@/components/Reveal";

/** Consistent frame around every recharts graph in the dashboards. */
export default function ChartCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={className}>
      <div className="stat-surface h-full p-5">
        <h3 className="text-base font-bold">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs opacity-60">{subtitle}</p>}
        <div className="mt-4 h-64 w-full">{children}</div>
      </div>
    </Reveal>
  );
}
