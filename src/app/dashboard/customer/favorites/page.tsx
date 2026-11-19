"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { HeartOff } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/EmptyState";
import EquipmentCard from "@/components/EquipmentCard";
import { api } from "@/lib/api";
import type { Equipment } from "@/lib/types";

export default function FavoritesPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    api
      .get<{ items: Equipment[] }>("/favorites")
      .then(({ items }) => {
        if (active) setItems(items);
      })
      .catch((err: unknown) => {
        if (active) toast.error(err instanceof Error ? err.message : "Could not load favorites.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const remove = async (item: Equipment) => {
    try {
      await api.delete(`/favorites/${item._id}`);
      setItems((prev) => prev.filter((e) => e._id !== item._id));
      toast.success("Removed from favorites.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update favorites.");
    }
  };

  return (
    <div>
      <PageHeader title="Favorites" subtitle="Equipment you saved for later — one click from booking." />

      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card-surface aspect-4/3 animate-pulse bg-base-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={<HeartOff className="size-6" />}
          title="No favorites saved"
          description="Tap the heart on any equipment card to keep it here for quick booking later."
          action={
            <Link href="/all-equipment" className="btn btn-primary btn-sm mt-2">
              Find equipment
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <EquipmentCard key={item._id} item={item} index={i} isFavorite onToggleFavorite={remove} />
          ))}
        </div>
      )}
    </div>
  );
}
