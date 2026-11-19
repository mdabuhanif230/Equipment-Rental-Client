"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import EquipmentCard from "@/components/EquipmentCard";
import { api } from "@/lib/api";
import type { Equipment } from "@/lib/types";

export default function FeaturedSection() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ items: Equipment[] }>("/equipment/featured")
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
    <section className="section-pad bg-base-100">
      <div className="container-page">
        <SectionHeading
          eyebrow="Handpicked for you"
          title={
            <>
              Featured <span className="brand-text">Equipment</span>
            </>
          }
          subtitle="The six most recent listings approved by our admins — ready to book today."
        >
          <Link href="/all-equipment" className="btn btn-outline btn-sm gap-2 mt-1 px-5 font-semibold">
            View all equipment <ArrowRight className="size-4" />
          </Link>
        </SectionHeading>

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card-surface aspect-4/3 animate-pulse bg-base-200" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <p className="text-center opacity-60">
              No approved equipment yet — check back soon.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.slice(0, 6).map((item, i) => (
                <EquipmentCard key={item._id} item={item} index={i} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
