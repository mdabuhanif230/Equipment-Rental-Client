"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ScrollText } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import BookingsTable from "@/components/dashboard/BookingsTable";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { Booking, Paginated } from "@/lib/types";

export default function AdminBookingsPage() {
  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [page, setPage] = useState(1);
  const [loadedPage, setLoadedPage] = useState<number | null>(null);
  const loading = loadedPage !== page;

  useEffect(() => {
    let active = true;
    api
      .get<Paginated<Booking>>(`/admin/bookings?page=${page}&limit=10`)
      .then((res) => {
        if (active) setData(res);
      })
      .catch((err: unknown) => {
        if (active) toast.error(err instanceof Error ? err.message : "Could not load bookings.");
      })
      .finally(() => {
        if (active) setLoadedPage(page);
      });
    return () => {
      active = false;
    };
  }, [page]);

  const paid = data?.items.filter((b) => b.paymentStatus === "paid").length ?? 0;
  const revenue = data?.items.reduce((sum, b) => sum + (b.paymentStatus === "paid" ? b.totalAmount : 0), 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="All bookings"
        subtitle="Every rental across the platform, newest first."
        actions={
          data && (
            <div className="flex gap-2">
              <span className="badge badge-ghost badge-sm">{paid} paid on this page</span>
              <span className="badge badge-success badge-sm">{formatCurrency(revenue)}</span>
            </div>
          )
        }
      />

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="size-6" />}
          title="No bookings yet"
          description="Bookings created by customers will appear here with payment and status details."
        />
      ) : (
        <>
          <BookingsTable variant="admin" items={data.items} />
          <Pagination page={data.page} pages={data.pages} onChange={setPage} busy={loading} />
        </>
      )}
    </div>
  );
}
