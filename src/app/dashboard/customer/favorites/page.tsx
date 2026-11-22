"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { HeartOff, MapPin, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import EmptyState from "@/components/EmptyState";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
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
        <div className="table-surface h-72 animate-pulse bg-base-200" />
      ) : items.length === 0 ? (
        <EmptyState
          icon={<HeartOff className="size-6" />}
          title="No favorites saved"
          description="Tap the heart on any equipment card to keep it here for quick booking later."
          action={
            <Link href="/all-equipment" className="ui-button ui-button-primary ui-button-sm mt-2">
              Find equipment
            </Link>
          }
        />
      ) : (
        <div className="table-surface scroll-thin overflow-x-auto">
          <table className="ui-table">
            <thead>
              <tr className="bg-base-200 text-xs uppercase tracking-wide">
                <th>Equipment</th><th>Category</th><th>Price</th><th>Location</th><th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id}>
                  <td className="min-w-64">
                    <div className="flex items-center gap-3">
                      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-base-200">
                        <Image
                          src={item.image || "/images/placeholder.png"}
                          alt=""
                          fill
                          sizes="56px"
                          unoptimized={item.image?.includes("i.ibb.co") || false}
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link href={`/equipment/${item._id}`} className="font-bold hover:text-primary">{item.name}</Link>
                        <p className="mt-1 flex items-center gap-1 text-xs opacity-60"><MapPin className="size-3" />{item.location}</p>
                      </div>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td className="whitespace-nowrap font-semibold">{formatCurrency(item.price)}<span className="ml-1 text-xs opacity-60">/{item.rentalType.toLowerCase()}</span></td>
                  <td>{item.location}</td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <Link href={`/equipment/${item._id}`} className="ui-button ui-button-primary ui-button-xs">View details</Link>
                      <button type="button" onClick={() => remove(item)} className="ui-button ui-button-ghost ui-button-xs text-error" aria-label={`Remove ${item.name} from favorites`}><Trash2 className="size-4" /> Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
