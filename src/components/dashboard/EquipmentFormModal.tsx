"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { api } from "@/lib/api";
import { uploadImageToImgBB } from "@/lib/upload-image";
import type { Equipment, RentalType } from "@/lib/types";

interface EquipmentFormModalProps {
  /** Pass an item to edit it; omit to create a new listing. */
  initial?: Equipment;
  admin?: boolean;
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

const CATEGORIES = [
  "Construction Equipment",
  "Photography Equipment",
  "Vehicles & Transportation",
  "Agriculture Equipment",
  "Electronics",
  "Event Equipment",
  "Power Tools",
];

/** Create / edit listing modal used by the owner dashboard (POST & PUT /api/equipment). */
export default function EquipmentFormModal({ initial, admin = false, onClose, onSaved }: EquipmentFormModalProps) {
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
  const [uploading, setUploading] = useState(false);

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const imageUrl = await uploadImageToImgBB(file);
      setForm((current) => ({ ...current, image: imageUrl }));
      toast.success("Image uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  };

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
        const endpoint = admin ? `/admin/equipment/${initial._id}` : `/equipment/${initial._id}`;
        const { item } = await api.put<{ item: Equipment }>(endpoint, payload);
        toast.success(admin ? "Equipment listing updated." : "Listing updated — it is back in the admin approval queue.");
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

  const field = "ui-input ui-input-bordered ui-input-sm w-full";

  return (
    <div className="ui-modal ui-modal-open" role="dialog" aria-modal="true" aria-label="Equipment form">
      <div className="ui-modal-box max-h-[92vh] w-11/12 max-w-3xl overflow-y-auto p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">{initial ? "Edit listing" : "New listing"}</span>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight">
              {initial ? initial.name : "Add equipment"}
            </h3>
            <p className="mt-1 text-xs opacity-60">
              {admin ? "Update listing details while keeping moderation in your control." : <>Saved listings start as <strong>pending</strong> and become public after an admin approves them.</>}
            </p>
          </div>
          <button type="button" className="ui-button ui-button-ghost ui-button-sm ui-button-circle" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="ui-form-control sm:col-span-2">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Name *</span>
            <input className={field} value={form.name} onChange={set("name")} required maxLength={120} />
          </label>

          <label className="ui-form-control sm:col-span-2">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Description *</span>
            <textarea
              className="ui-textarea ui-textarea-bordered ui-textarea-sm w-full"
              rows={3}
              maxLength={3000}
              value={form.description}
              onChange={set("description")}
              required
            />
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Category *</span>
            <select className="ui-select ui-select-bordered ui-select-sm w-full" value={form.category} onChange={set("category")} required>
              <option value="" disabled>Select a category</option>
              {form.category && !CATEGORIES.includes(form.category) && <option value={form.category}>{form.category}</option>}
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Location *</span>
            <input className={field} value={form.location} onChange={set("location")} placeholder="Dhaka" required />
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Price per unit *</span>
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

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Rental type *</span>
            <select className="ui-select ui-select-bordered ui-select-sm" value={form.rentalType} onChange={set("rentalType")}>
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Quantity *</span>
            <input type="number" min={0} className={field} value={form.quantity} onChange={set("quantity")} required />
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Condition *</span>
            <select className="ui-select ui-select-bordered ui-select-sm" value={form.condition} onChange={set("condition")}>
              {["Excellent", "Very Good", "Good", "Fair"].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Brand *</span>
            <input className={field} value={form.brand} onChange={set("brand")} placeholder="Makita" required />
          </label>

          <label className="ui-form-control">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Model *</span>
            <input className={field} value={form.model} onChange={set("model")} placeholder="DTW285Z" required />
          </label>

          <div className="ui-form-control sm:col-span-2">
            <label htmlFor="equipment-image-url" className="ui-label py-1 text-xs font-semibold opacity-70">Equipment image *</label>
            <input id="equipment-image-url" className={field} value={form.image} onChange={set("image")} placeholder="Paste an image URL or upload a file" required />
            {/^https?:\/\//i.test(form.image) && (
              <div className="mt-3 overflow-hidden rounded-xl border border-base-300 bg-base-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image}
                  alt="Equipment preview"
                  className="h-40 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
            <span className="mt-2 flex flex-wrap items-center gap-3">
              <label className={`ui-button ui-button-outline ui-button-sm gap-2 ${uploading ? "pointer-events-none opacity-60" : "cursor-pointer"}`}>
                {uploading ? <LoaderCircle className="size-4 animate-spin" /> : <ImagePlus className="size-4" />}
                {uploading ? "Uploading…" : "Upload to ImgBB"}
                <input type="file" accept="image/*" className="sr-only" onChange={uploadImage} disabled={uploading || saving} />
              </label>
              <span className="text-xs opacity-55">JPEG, PNG or WebP · Max 32 MB</span>
            </span>
          </div>

          <label className="ui-form-control sm:col-span-2">
            <span className="ui-label py-1 text-xs font-semibold opacity-70">Rental terms *</span>
            <textarea
              className="ui-textarea ui-textarea-bordered ui-textarea-sm w-full"
              rows={3}
              maxLength={2000}
              value={form.rentalTerms}
              onChange={set("rentalTerms")}
              required
              placeholder="Deposit, delivery, damage policy…"
            />
          </label>

          <div className="ui-modal-action mt-0 sm:col-span-2">
            <button type="button" className="ui-button ui-button-ghost" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="ui-button ui-button-primary font-bold" disabled={saving || uploading}>
              {saving ? <span className="ui-loading ui-loading-spinner ui-loading-sm" /> : null}
              {initial ? "Save changes" : "Submit listing"}
            </button>
          </div>
        </form>
      </div>
      <button type="button" className="ui-modal-backdrop" onClick={onClose} aria-label="Close dialog">
        Close
      </button>
    </div>
  );
}
