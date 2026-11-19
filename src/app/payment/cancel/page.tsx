"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { CircleX, CreditCard, Home, XCircle } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

function PaymentCancelInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id") || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    api
      .get<{ item: Booking }>(`/bookings/${bookingId}`)
      .then(({ item }) => {
        if (active) setBooking(item);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Booking could not be loaded.");
      });
    return () => {
      active = false;
    };
  }, [bookingId]);

  // Retry → a brand-new Stripe Checkout session for the same pending booking
  const retryPayment = async () => {
    setBusy(true);
    try {
      const { checkoutUrl } = await api.post<{ checkoutUrl: string }>(`/bookings/${bookingId}/pay`);
      window.location.href = checkoutUrl;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not restart the payment.");
      setBusy(false);
    }
  };

  // Give up → cancel the pending hold
  const cancelBooking = async () => {
    setBusy(true);
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled — no payment was taken.");
      setBooking((b) => (b ? { ...b, status: "cancelled" } : b));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not cancel this booking.");
    } finally {
      setBusy(false);
    }
  };

  const cancellable = booking && booking.status === "pending" && booking.paymentStatus === "unpaid";

  return (
    <div className="container-page grid min-h-[65vh] place-items-center py-14">
      <div className="w-full max-w-xl">
        <div className="card-surface overflow-hidden text-center">
          <div className="bg-error/10 px-6 py-8">
            <span className="bg-error mx-auto grid size-16 place-items-center rounded-full">
              <CircleX className="size-9" />
            </span>
            <h1 className="text-error mt-4 text-2xl font-extrabold tracking-tight">
              Payment not completed
            </h1>
            <p className="mt-2 px-4 text-sm opacity-75">
              You left Stripe Checkout before finishing. Your booking is still on hold for a short
              window — you can retry safely.
            </p>
          </div>

          <div className="p-6 text-left">
            {error && <div className="alert alert-warning mb-4 text-xs">{error}</div>}

            {booking ? (
              <div className="bg-base-200 mb-5 rounded-2xl p-4 text-sm">
                <p className="font-bold">{booking.equipmentName}</p>
                <p className="mt-1 opacity-65">
                  {formatShortDate(booking.startDate)} → {formatShortDate(booking.endDate)} ·{" "}
                  {booking.quantity} unit(s)
                </p>
                <p className="mt-2 text-xl font-black text-primary">
                  {formatCurrency(booking.totalAmount)}
                </p>
                <p className="mt-1 flex gap-2">
                  <span className="badge badge-sm capitalize badge-outline">{booking.status}</span>
                  <span className="badge badge-warning badge-sm capitalize">{booking.paymentStatus}</span>
                </p>
              </div>
            ) : (
              <p className="mb-5 flex items-center gap-2 text-sm opacity-60">
                <span className="loading loading-spinner loading-sm" /> Loading booking…
              </p>
            )}

            <div className="grid gap-3">
              <button
                type="button"
                className="btn btn-primary font-bold"
                onClick={retryPayment}
                disabled={busy || !booking || !cancellable}
              >
                <CreditCard className="size-4" /> Try payment again
              </button>
              <button
                type="button"
                className="btn btn-outline btn-error"
                onClick={cancelBooking}
                disabled={busy || !cancellable}
              >
                <XCircle className="size-4" /> Cancel this booking
              </button>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link href="/dashboard/customer" className="btn btn-ghost btn-sm">
                  My bookings
                </Link>
                <Link href="/" className="btn btn-ghost btn-sm">
                  <Home className="size-4" /> Back home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCancelPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard>
        <PaymentCancelInner />
      </AuthGuard>
    </Suspense>
  );
}
