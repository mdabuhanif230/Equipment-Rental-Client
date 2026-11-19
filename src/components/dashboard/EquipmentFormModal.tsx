"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import type { Equipment, RentalType } from "@/lib/types";

interface EquipmentFormModalProps {
  /** Pass an item to edit it; omit to create a new listing. */
  initial?: Equipment;
  onClose: () => void;
  onSaved: (item: Equipment) => void;
}

const EMPTY = {
  name: "",
  description: "",
  category: "",
  location: "",
  price: "",
  rentalType: "Daily" as RentalType,
  quantity: "1",
  condition: "Excellent",
  brand: "",
  model: "",
  image: "",
  rentalTerms: "",
};

/** Create / edit listing modal used by the owner dashboard (POST & PUT /api/equipment). */
export default function EquipmentFormModal({ initial, onClose, onSaved }: EquipmentFormModalProps) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          name: initial.name,
          description: initial.description,
          category: initial.category,
          location: initial.location,
          price: String(initial.price),
          rentalType: initial.rentalType,
          quantity: String(initial.quantity),
          condition: initial.condition,
          brand: initial.brand,
          model: initial.model,
          image: initial.image,
          rentalTerms: initial.rentalTerms,
        }
      : { ...EMPTY },
  );
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      quantity: Number(form.quantity),
    };

    if (!payload.name || !payload.description || !payload.category || !payload.location) {
      toast.error("Please fill in every required field.");
      return;
    }
    if (!Number.isFinite(payload.price) || payload.price <= 0) {
      toast.error("Price must be greater than 0.");
      return;
    }
    if (!/^https?:\/\//.test(payload.image)) {
      toast.error("Image must be a valid URL (https://…).");
      return;
    }

    setSaving(true);
    try {
      if (initial) {
        const { item } = await api.put<{ item: Equipment }>(`/equipment/${initial._id}`, payload);
        toast.success("Listing updated — it is back in the admin approval queue.");
        onSaved(item);
      } else {
        const { item } = await api.post<{ item: Equipment }>("/equipment", payload);
        toast.success("Equipment submitted for admin approval.");
        onSaved(item);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not save the equipment.");
      setSaving(false);
    }
  };

  const field = "input input-bordered input-sm w-full";

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label="Equipment form">
      <div className="modal-box max-h-[92vh] w-11/12 max-w-3xl overflow-y-auto p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">{initial ? "Edit listing" : "New listing"}</span>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight">
              {initial ? initial.name : "Add equipment"}
            </h3>
            <p className="mt-1 text-xs opacity-60">
              Saved listings start as <strong>pending</strong> and become public after an admin
              approves them.
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="form-control sm:col-span-2">
            <span className="label py-1 text-xs font-semibold opacity-70">Name *</span>
            <input className={field} value={form.name} onChange={set("name")} required maxLength={120} />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label py-1 text-xs font-semibold opacity-70">Description *</span>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              rows={3}
              maxLength={3000}
              value={form.description}
              onChange={set("description")}
              required
            />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Category *</span>
            <input className={field} value={form.category} onChange={set("category")} placeholder="Power Tools" required />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Location *</span>
            <input className={field} value={form.location} onChange={set("location")} placeholder="Dhaka" required />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Price per unit *</span>
            <input
              type="number"
              min={1}
              step="0.01"
              className={field}
              value={form.price}
              onChange={set("price")}
              required
            />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Rental type *</span>
            <select className="select select-bordered select-sm" value={form.rentalType} onChange={set("rentalType")}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Quantity *</span>
            <input type="number" min={0} className={field} value={form.quantity} onChange={set("quantity")} required />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Condition *</span>
            <select className="select select-bordered select-sm" value={form.condition} onChange={set("condition")}>
              {["Excellent", "Very Good", "Good", "Fair"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Brand *</span>
            <input className={field} value={form.brand} onChange={set("brand")} placeholder="Makita" required />
          </label>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Model *</span>
            <input className={field} value={form.model} onChange={set("model")} placeholder="DTW285Z" required />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label py-1 text-xs font-semibold opacity-70">Image URL *</span>
            <input
              className={field}
              value={form.image}
              onChange={set("image")}
              placeholder="https://i.ibb.co/xxxx.jpg"
              required
            />
          </label>

          <label className="form-control sm:col-span-2">
            <span className="label py-1 text-xs font-semibold opacity-70">Rental terms *</span>
            <textarea
              className="textarea textarea-bordered textarea-sm w-full"
              rows={3}
              maxLength={2000}
              value={form.rentalTerms}
              onChange={set("rentalTerms")}
              required
              placeholder="Deposit, delivery, damage policy…"
            />
          </label>

          <div className="modal-action mt-0 sm:col-span-2">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary font-bold" disabled={saving}>
              {saving ? <span className="loading loading-spinner loading-sm" /> : null}
              {initial ? "Save changes" : "Submit listing"}
            </button>
          </div>
        </form>
      </div>
      <button type="button" className="modal-backdrop" onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </div>
  );
}
