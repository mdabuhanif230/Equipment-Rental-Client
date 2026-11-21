"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Inbox } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import BookingsTable from "@/components/dashboard/BookingsTable";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import type { Booking, Paginated } from "@/lib/types";

export default function OwnerBookingsPage() {
  const [data, setData] = useState<Paginated<Booking> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Paginated<Booking>>(`/bookings/owner?page=${page}&limit=10`)
      .then((res) => setData(res))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not load bookings."),
      )
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  // Only paid, confirmed bookings can be closed out
  const markCompleted = async (id: string) => {
    setBusyId(id);
    try {
      await api.patch(`/bookings/${id}/status`, { status: "completed" });
      toast.success("Booking marked as completed.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the booking.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Bookings on your equipment"
        subtitle="Confirm handovers by marking paid rentals as completed."
        actions={
          <Link href="/dashboard/owner/equipment" className="ui-button ui-button-outline ui-button-sm font-semibold">
            My equipment
          </Link>
        }
      />

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<Inbox className="size-6" />}
          title="No bookings yet"
          description="When a customer books one of your approved listings, it appears here for handover."
          action={
            <Link href="/dashboard/owner/equipment" className="ui-button ui-button-primary ui-button-sm mt-2">
              Manage listings
            </Link>
          }
        />
      ) : (
        <>
          <BookingsTable variant="owner" items={data.items} onComplete={markCompleted} busyId={busyId} />
          <Pagination page={data.page} pages={data.pages} onChange={setPage} busy={loading} />
        </>
      )}
    </div>
  );
}
