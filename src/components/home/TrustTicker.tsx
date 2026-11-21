import { BadgeCheck, CalendarDays, MapPin, ShieldCheck, Sparkles, Wallet } from "lucide-react";

const signals = [
  { icon: ShieldCheck, label: "Secure online checkout" },
  { icon: BadgeCheck, label: "Verified equipment owners" },
  { icon: CalendarDays, label: "Daily, weekly & monthly rentals" },
  { icon: Wallet, label: "Transparent pricing" },
  { icon: MapPin, label: "Gear right near you" },
  { icon: Sparkles, label: "New listings every week" },
];

/** Seamless marquee of the marketplace's strongest signals. */
export default function TrustTicker() {
  const loop = [...signals, ...signals];
  return (
    <div className="relative overflow-hidden border-y border-primary/10 bg-primary/[0.045] py-3.5">
      <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-100 to-transparent" />
      <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-100 to-transparent" />
      <div className="rentgear-marquee flex w-max items-center">
        {loop.map(({ icon: Icon, label }, index) => (
          <span
            key={`${label}-${index}`}
            className="inline-flex shrink-0 items-center gap-2.5 pr-12 text-[11px] font-black uppercase tracking-[0.2em] text-primary/80"
          >
            <Icon className="size-4 text-accent" />
            {label}
            <span className="ml-8 size-1.5 rotate-45 bg-accent/60" aria-hidden />
          </span>
        ))}
      </div>
    </div>
  );
}
