"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Camera,
  HardHat,
  Leaf,
  Laptop,
  PartyPopper,
  Sparkles,
  Truck,
  Volume2,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";
import { api } from "@/lib/api";
import type { CategoryCount } from "@/lib/types";

const ICONS: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["power", "tool", "drill", "saw"], icon: Wrench },
  { keywords: ["construct", "heavy", "excavator", "machine"], icon: HardHat },
  { keywords: ["vehicle", "car", "truck", "van", "bike"], icon: Truck },
  { keywords: ["garden", "lawn", "outdoor", "landscap"], icon: Leaf },
  { keywords: ["event", "party", "tent", "wedding"], icon: PartyPopper },
  { keywords: ["audio", "sound", "music", "dj", "speaker"], icon: Volume2 },
  { keywords: ["camera", "photo", "video", "lens"], icon: Camera },
  { keywords: ["computer", "laptop", "it ", "office"], icon: Laptop },
  { keywords: ["clean", "wash", "home"], icon: Sparkles },
];

function iconFor(category: string): LucideIcon {
  const key = category.toLowerCase();
  return ICONS.find((entry) => entry.keywords.some((k) => key.includes(k)))?.icon ?? Wrench;
}

export default function CategoriesSection() {
  const [items, setItems] = useState<CategoryCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ items: CategoryCount[] }>("/equipment/categories")
      .then(({ items }) => {
        if (active) setItems(items);
      })
      .catch(() => {
        if (active) setItems([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="section-pad bg-base-200">
      <div className="container-page">
        <SectionHeading
          eyebrow="Browse by category"
          title="Find the exact gear for the job"
          subtitle="Every category is populated by real owners and checked by our admins before it goes live."
        />

        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {(loading ? Array.from({ length: 4 }) : items).map((entry, i) => {
            const category = (entry as CategoryCount | undefined)?.category;
            const count = (entry as CategoryCount | undefined)?.count;
            const Icon = category ? iconFor(category) : Wrench;

            return (
              <Reveal key={category ?? i} delay={Math.min(i * 0.06, 0.3)}>
                <Link
                  href={
                    category
                      ? `/all-equipment?category=${encodeURIComponent(category)}`
                      : "/all-equipment"
                  }
                  className="card-surface group flex h-full flex-col items-center gap-2 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary hover:shadow-lg"
                >
                  <span className="bg-primary/10 text-primary grid size-14 place-items-center rounded-2xl transition-colors group-hover:bg-primary group-hover:text-primary-content">
                    {category ? <Icon className="size-6" /> : <span className="skeleton size-6 rounded-full" />}
                  </span>
                  <span className="font-bold">{category ?? "Loading…"}</span>
                  {category && (
                    <span className="text-xs font-medium opacity-60">{count} item(s)</span>
                  )}
                </Link>
              </Reveal>
            );
          })}
        </div>

        {!loading && items.length === 0 && (
          <p className="mt-8 text-center text-sm opacity-60">
            Categories appear once equipment is approved.
          </p>
        )}
      </div>
    </section>
  );
}
