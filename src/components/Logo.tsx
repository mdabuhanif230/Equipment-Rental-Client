import { Cog } from "lucide-react";

/** Wordmark logo — a gear mark + "RentGear" name, used in navbar & footer. */
export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <span className="grid size-9 place-items-center rounded-xl brand-gradient text-base-100 shadow-sm">
        <Cog className="size-5" strokeWidth={2.4} aria-hidden />
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        Rent<span className="brand-text">Gear</span>
      </span>
    </span>
  );
}
