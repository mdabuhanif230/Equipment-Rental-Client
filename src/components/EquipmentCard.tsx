"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, MapPin, ShieldCheck } from "lucide-react";
import type { Equipment } from "@/lib/types";

interface EquipmentCardProps {
  item: Equipment;
  isFavorite?: boolean;
  onToggleFavorite?: (item: Equipment) => void;
  index?: number;
}

export default function EquipmentCard({
  item,
  isFavorite,
  onToggleFavorite,
  index = 0,
}: EquipmentCardProps) {
  const inStock = item.quantity > 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay: Math.min(index * 0.07, 0.4) }}
      className="card-surface group flex flex-col overflow-hidden transition-shadow duration-300 hover:shadow-xl"
    >
      <Link href={`/equipment/${item._id}`} className="relative block aspect-video overflow-hidden">
        {item.image?.startsWith("http") ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- local SVG fallback
          <img
            src="/images/placeholder.svg"
            alt={item.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <span className="badge badge-primary badge-sm absolute top-3 left-3 font-semibold text-primary-content">
          {item.category}
        </span>
        <span
          className={`badge badge-sm absolute top-3 right-3 font-bold ${
            inStock ? "badge-success" : "badge-error"
          }`}
        >
          {inStock ? `${item.quantity} available` : "Unavailable"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-bold leading-snug">
              <Link href={`/equipment/${item._id}`} className="transition hover:text-primary">
                {item.name}
              </Link>
            </h3>
            <p className="mt-1 flex items-center gap-1.5 text-xs opacity-60">
              <MapPin className="size-3.5 shrink-0" /> {item.location}
            </p>
          </div>

          {onToggleFavorite && (
            <button
              type="button"
              onClick={() => onToggleFavorite(item)}
              className={`btn btn-circle btn-xs ${
                isFavorite ? "btn-error" : "btn-ghost border border-base-content/10"
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`size-4 ${isFavorite ? "fill-current" : ""}`} />
            </button>
          )}
        </div>

        <p className="line-clamp-2 text-sm leading-relaxed opacity-70">{item.description}</p>

        <div className="flex flex-wrap gap-1.5">
          <span className="badge badge-ghost badge-sm">{item.condition}</span>
          <span className="badge badge-ghost badge-sm">{item.brand}</span>
          <span className="badge badge-ghost badge-sm">{item.rentalType} rental</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-base-content/10 pt-3 border-t">
          <p className="text-lg font-extrabold">
            ${item.price}
            <span className="text-xs font-medium opacity-60">
              /{item.rentalType === "Daily" ? "day" : item.rentalType === "Weekly" ? "week" : "month"}
            </span>
          </p>
          <Link href={`/equipment/${item._id}`} className="btn btn-primary btn-sm px-4 font-semibold">
            View Details
          </Link>
        </div>

        {item.status !== "approved" && (
          <p className="badge badge-warning badge-outline gap-1 text-xs">
            <ShieldCheck className="size-3.5" /> Awaiting approval
          </p>
        )}
      </div>
    </motion.article>
  );
}
