"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { PackageOpen, Pencil, Plus, Trash2 } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { EquipmentStatusBadge } from "@/components/dashboard/Badges";
import EquipmentFormModal from "@/components/dashboard/EquipmentFormModal";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Equipment, Paginated } from "@/lib/types";

export default function OwnerEquipmentPage() {
  const [data, setData] = useState<Paginated<Equipment> | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Equipment | undefined>(undefined);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    api
      .get<Paginated<Equipment>>(`/owner/equipment?page=${page}&limit=10`)
      .then((res) => setData(res))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not load your equipment."),
      )
      .finally(() => setLoading(false));
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(undefined);
    setModalOpen(true);
  };

  const openEdit = (item: Equipment) => {
    setEditing(item);
    setModalOpen(true);
  };

  const remove = async (item: Equipment) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    setBusyId(item._id);
    try {
      await api.delete(`/equipment/${item._id}`);
      toast.success("Equipment deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete this equipment.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="My Equipment"
        subtitle="Add, edit and remove listings. Edited items return to the admin approval queue."
        actions={
          <button type="button" className="ui-button ui-button-primary ui-button-sm gap-2 font-semibold" onClick={openCreate}>
            <Plus className="size-4" /> Add equipment
          </button>
        }
      />

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<PackageOpen className="size-6" />}
          title="You have not listed anything yet"
          description="Publish your first item and it will go live as soon as an admin approves it."
          action={
            <button type="button" className="ui-button ui-button-primary ui-button-sm mt-2 gap-2" onClick={openCreate}>
              <Plus className="size-4" /> Add equipment
            </button>
          }
        />
      ) : (
        <>
          <div className="table-surface scroll-thin overflow-x-auto">
            <table className="ui-table ui-table-sm">
              <thead>
                <tr className="bg-base-200 text-xs uppercase tracking-wide">
                  <th>Equipment</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
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
                    <td>{item.category}</td>
                    <td className="whitespace-nowrap font-semibold">
                      {formatCurrency(item.price)}
                      <span className="text-xs opacity-55">
                        /{item.rentalType === "Daily" ? "day" : item.rentalType === "Weekly" ? "week" : "month"}
                      </span>
                    </td>
                    <td className="font-semibold">{item.quantity}</td>
                    <td><EquipmentStatusBadge status={item.status} /></td>
                    <td className="whitespace-nowrap text-xs">{formatShortDate(item.createdAt)}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          className="ui-button ui-button-ghost ui-button-xs gap-1"
                          onClick={() => openEdit(item)}
                        >
                          <Pencil className="size-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          className="ui-button ui-button-ghost ui-button-xs gap-1 text-error"
                          disabled={busyId === item._id}
                          onClick={() => remove(item)}
                        >
                          <Trash2 className="size-3.5" /> Delete
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

      {modalOpen && (
        <EquipmentFormModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setPage(1);
            setLoading(true);
            load();
          }}
        />
      )}
    </div>
  );
}
