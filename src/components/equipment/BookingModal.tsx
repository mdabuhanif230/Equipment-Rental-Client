"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { CalendarRange, CreditCard, Info, Loader2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Equipment } from "@/lib/types";

interface Availability {
  available: number;
  days: number;
  estimate: { units: number; total: number };
}

interface BookingModalProps {
  item: Equipment;
  onClose: () => void;
}

const today = () => new Date().toISOString().slice(0, 10);

/** Booking modal: dates, quantity, contact details and the live Stripe-bound total.
 *  Mounted only while open, so the profile contact details prefill on mount. */
export default function BookingModal({ item, onClose }: BookingModalProps) {
  const { user } = useAuth();
  const [form, setForm] = useState(() => ({
    startDate: today(),
    endDate: "",
    quantity: 1,
    phone: user?.phone || "",
    address: user?.address || "",
    notes: "",
  }));
  const [avail, setAvail] = useState<{ key: string; data: Availability | null } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const dateError = useMemo(() => {
    if (!form.startDate || !form.endDate) return "";
    if (form.endDate < form.startDate) return "End date cannot be before the start date.";
    if (form.startDate < today()) return "Start date cannot be in the past.";
    return "";
  }, [form.startDate, form.endDate]);

  const availKey = `${form.startDate}|${form.endDate}|${form.quantity}`;
  const needsCheck = Boolean(form.startDate && form.endDate && !dateError);
  const checked = avail?.key === availKey ? avail : null;
  const availability = checked?.data ?? null;
  const checking = needsCheck && checked === null;

  // Ask the server for the authoritative availability + total
  useEffect(() => {
    if (!needsCheck) return;
    let active = true;
    const timer = setTimeout(() => {
      const params = new URLSearchParams({
        startDate: form.startDate,
        endDate: form.endDate,
        quantity: String(form.quantity),
      });
      api
        .get<Availability>(`/equipment/${item._id}/availability?${params}`)
        .then((data) => {
          if (active) setAvail({ key: availKey, data });
        })
        .catch((err: unknown) => {
          if (active) {
            setAvail({ key: availKey, data: null });
            if (err instanceof Error) toast.error(err.message);
          }
        });
    }, 350);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [needsCheck, availKey, item._id, form.startDate, form.endDate, form.quantity]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (dateError) {
      toast.error(dateError);
      return;
    }
    if (!form.endDate) {
      toast.error("Please choose an end date.");
      return;
    }
    if (!form.phone.trim()) {
      toast.error("A contact number is required.");
      return;
    }
    if (!form.address.trim()) {
      toast.error("A delivery address is required.");
      return;
    }
    if (availability && availability.available < form.quantity) {
      toast.error("Not enough units are available for those dates.");
      return;
    }

    setSubmitting(true);
    try {
      const { checkoutUrl } = await api.post<{ bookingId: string; checkoutUrl: string }>("/bookings", {
        equipmentId: item._id,
        startDate: form.startDate,
        endDate: form.endDate,
        quantity: form.quantity,
        phone: form.phone.trim(),
        address: form.address.trim(),
        notes: form.notes.trim(),
      });
      toast.success("Booking created — redirecting to secure checkout…");
      window.location.href = checkoutUrl; // Stripe Checkout
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create the booking.");
      setSubmitting(false);
    }
  };

  const field = "input input-bordered input-sm w-full";

  return (
    <div className="modal modal-open" role="dialog" aria-modal="true" aria-label={`Book ${item.name}`}>
      <div className="modal-box max-h-[92vh] w-11/12 max-w-2xl overflow-y-auto p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="eyebrow">Booking request</span>
            <h3 className="mt-2 text-xl font-extrabold tracking-tight">{item.name}</h3>
            <p className="mt-1 text-sm opacity-60">
              {formatCurrency(item.price)} per{" "}
              {item.rentalType === "Daily" ? "day" : item.rentalType === "Weekly" ? "week" : "month"} ·{" "}
              {item.quantity} unit(s) listed
            </p>
          </div>
          <button type="button" className="btn btn-ghost btn-sm btn-circle" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Start date *</span>
              <input
                type="date"
                required
                min={today()}
                className={field}
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">End date *</span>
              <input
                type="date"
                required
                min={form.startDate || today()}
                className={field}
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Quantity *</span>
              <input
                type="number"
                required
                min={1}
                max={item.quantity}
                className={field}
                value={form.quantity}
                onChange={(e) => setForm((f) => ({ ...f, quantity: Math.max(Number(e.target.value) || 1, 1) }))}
              />
            </label>
          </div>

          {dateError && <p className="text-error text-xs font-semibold">{dateError}</p>}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Phone number *</span>
              <input
                type="tel"
                required
                placeholder="+880 1700-000000"
                className={field}
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </label>
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Delivery address *</span>
              <input
                type="text"
                required
                placeholder="House 12, Road 5, Dhaka"
                className={field}
                value={form.address}
                onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              />
            </label>
          </div>

          <label className="form-control">
            <span className="label py-1 text-xs font-semibold opacity-70">Notes (optional)</span>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Anything the owner should know…"
              className="textarea textarea-bordered textarea-sm w-full"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </label>

          {/* live total straight from the availability endpoint */}
          <div className="bg-base-200 rounded-2xl p-4">
            {checking ? (
              <p className="flex items-center gap-2 text-sm opacity-70">
                <Loader2 className="size-4 animate-spin" /> Checking availability…
              </p>
            ) : availability ? (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <p className="flex items-center gap-2 font-semibold">
                    <CalendarRange className="size-4 text-primary" />
                    {availability.days} day(s) · {availability.estimate.units} rental unit(s)
                  </p>
                  <p className="mt-1 flex items-center gap-2 text-xs opacity-70">
                    <Users className="size-3.5" /> {availability.available} of {item.quantity} available
                  </p>
                </div>
                <p className="text-right">
                  <span className="block text-xs opacity-60">Estimated total</span>
                  <span className="text-2xl font-black text-primary">
                    {formatCurrency(availability.estimate.total)}
                  </span>
                </p>
              </div>
            ) : checked ? (
              <p className="text-error flex items-start gap-2 text-xs font-semibold">
                <Info className="mt-0.5 size-4 shrink-0" /> Availability could not be verified —
                please try again in a moment.
              </p>
            ) : (
              <p className="flex items-start gap-2 text-xs opacity-70">
                <Info className="mt-0.5 size-4 shrink-0 text-primary" /> Choose both dates to see
                live availability and the exact total.
              </p>
            )}
          </div>

          <p className="text-xs leading-relaxed opacity-60">
            Creating a booking holds the stock for 35 minutes while you complete the Stripe payment.
            You can cancel an unpaid booking from your dashboard at any time.
          </p>

          <div className="modal-action mt-0">
            <button type="button" className="btn btn-ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2 font-bold"
              disabled={submitting || checking || !!dateError}
            >
              {submitting ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Continue to payment
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
