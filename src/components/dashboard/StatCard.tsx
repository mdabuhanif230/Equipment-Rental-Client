import type { LucideIcon } from "lucide-react";
import Reveal from "@/components/Reveal";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  hint?: string;
  tone?: "primary" | "secondary" | "success" | "info";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
  primary: "bg-primary/12 text-primary",
  secondary: "bg-secondary/18 text-secondary",
  success: "bg-success/12 text-success",
  info: "bg-info/12 text-info",
};

/** Single KPI tile used at the top of every dashboard. */
export default function StatCard({ icon: Icon, label, value, hint, tone = "primary" }: StatCardProps) {
  return (
    <Reveal>
      <div className="stat-surface flex items-center gap-4 p-5">
        <span className={`grid size-12 shrink-0 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon className="size-6" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-xs font-bold tracking-wide uppercase opacity-55">
            {label}
          </span>
          <span className="block truncate text-2xl font-black">{value}</span>
          {hint && <span className="block truncate text-xs opacity-55">{hint}</span>}
        </span>
      </div>
    </Reveal>
  );
}
