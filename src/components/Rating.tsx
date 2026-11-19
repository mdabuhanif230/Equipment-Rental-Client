import { Star } from "lucide-react";

/** 1–5 star rating display (supports halves visually via filled count). */
export default function Rating({
  value,
  size = "sm",
  showValue = false,
}: {
  value: number;
  size?: "xs" | "sm" | "md";
  showValue?: boolean;
}) {
  const px = size === "xs" ? 12 : size === "sm" ? 15 : 18;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            width={px}
            height={px}
            className={n <= Math.round(value) ? "fill-secondary text-secondary" : "text-base-content/25"}
          />
        ))}
      </span>
      {showValue && <span className="text-xs font-bold opacity-70">{value.toFixed(1)}</span>}
    </span>
  );
}
