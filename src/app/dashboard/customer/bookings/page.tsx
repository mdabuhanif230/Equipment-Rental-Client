"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { CalendarX2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import BookingsTable from "@/components/dashboard/BookingsTable";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import type { Booking, Paginated } from "@/lib/types";

export default function CustomerBookingsPage() {
  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Paginated<Booking>>(`/bookings/my?page=${page}&limit=10`)
      .then((res) => setData(res))
      .catch((err: unknown) => toast.error(err instanceof Error ? err.message : "Could not load bookings."))
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const cancelBooking = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}/cancel`);
      toast.success("Booking cancelled.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this booking.");
    } finally {
      setBusyId(null);
    }
  };

  const payBooking = async (id: string) => {
    setBusyId(id);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>(`/bookings/${id}/pay`);
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not start the payment.");
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Bookings"
        subtitle="Every rental you have requested, with live payment and status."
        actions={
          <Link href="/all-equipment" className="btn btn-outline btn-sm font-semibold">
            New booking
          </Link>
        }
      />

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<CalendarX2 className="size-6" />}
          title="No bookings yet"
          description="Once you book equipment, every rental, payment and cancellation shows up here."
          action={
            <Link href="/all-equipment" className="btn btn-primary btn-sm mt-2">
              Browse equipment
            </Link>
          }
        />
      ) : (
        <>
          <BookingsTable
            variant="customer"
            items={data.items}
            onCancel={cancelBooking}
            onPay={payBooking}
            busyId={busyId}
          />
          <Pagination page={data.page} pages={data.pages} onChange={setPage} busy={loading} />
        </>
      )}
    </div>
  );
}
