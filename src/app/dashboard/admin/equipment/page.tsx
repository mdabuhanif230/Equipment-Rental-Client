"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { EquipmentStatusBadge } from "@/components/dashboard/Badges";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Equipment, EquipmentStatus, Paginated } from "@/lib/types";

const FILTERS: Array<{ value: EquipmentStatus | ""; label: string }> = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function AdminEquipmentPage() {
  const [data, setData] = useState<Paginated<Equipment> | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EquipmentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (status) params.set("status", status);

    api
      .get<Paginated<Equipment>>(`/admin/equipment?${params}`)
      .then((res) => setData(res))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not load equipment."),
      )
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatusFor = async (item: Equipment, next: EquipmentStatus) => {
    setBusyId(item._id);
    try {
      await api.patch<{ item: Equipment }>(`/admin/equipment/${item._id}/status`, { status: next });
      toast.success(`"${item.name}" is now ${next}.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update the status.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Equipment moderation"
        subtitle="Approve new listings to publish them, or reject items that break the rules."
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value || "all"}
            type="button"
            className={`btn btn-xs ${status === f.value ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              setPage(1);
              setStatus(f.value);
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<ListChecks className="size-6" />}
          title="Nothing in this queue"
          description="No equipment matches the selected status filter."
        />
      ) : (
        <>
          <div className="table-surface scroll-thin overflow-x-auto">
            <table className="table table-sm">
              <thead>
                <tr className="bg-base-200 text-xs uppercase tracking-wide">
                  <th>Equipment</th>
                  <th>Owner</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Moderation</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item._id}>
                    <td className="min-w-52">
                      <p className="font-bold">{item.name}</p>
                      <p className="text-xs opacity-55">
                        {item.brand} {item.model} · {item.location}
                      </p>
                    </td>
                    <td className="min-w-40">
                      <p className="text-sm font-semibold">{item.ownerName}</p>
                      <p className="truncate text-xs opacity-55">{item.ownerEmail}</p>
                    </td>
                    <td className="text-sm">{item.category}</td>
                    <td className="whitespace-nowrap font-semibold">{formatCurrency(item.price)}</td>
                    <td className="font-semibold">{item.quantity}</td>
                    <td><EquipmentStatusBadge status={item.status} /></td>
                    <td className="whitespace-nowrap text-xs">{formatShortDate(item.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          className="btn btn-success btn-xs gap-1 text-success-content"
                          disabled={busyId === item._id || item.status === "approved"}
                          onClick={() => setStatusFor(item, "approved")}
                        >
                          <CheckCircle2 className="size-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-error btn-xs gap-1"
                          disabled={busyId === item._id || item.status === "rejected"}
                          onClick={() => setStatusFor(item, "rejected")}
                        >
                          <XCircle className="size-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} busy={loading} />
        </>
      )}
    </div>
  );
}
