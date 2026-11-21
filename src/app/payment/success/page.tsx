"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { BadgeCheck, CalendarDays, CreditCard, Loader2, PackageCheck } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { api } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

function PaymentSuccessInner() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id") || "";

  const [booking, setBooking] = useState<Booking | null>(null);
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState("");

  const token = `${bookingId}#${attempt}`;
  const loading = Boolean(bookingId) && verifiedToken !== token;

  // The server asks Stripe directly — the client never trusts its own state
  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    api
      .post<{ item: Booking }>(`/bookings/${bookingId}/verify`)
      .then(({ item }) => {
        if (!active) return;
        setBooking(item);
        setError("");
        if (item.paymentStatus === "paid") toast.success("Payment confirmed!");
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not verify this payment.");
      })
      .finally(() => {
        if (active) setVerifiedToken(token);
      });
    return () => {
      active = false;
    };
  }, [bookingId, token]);

  const paid = booking?.paymentStatus === "paid";
  const finalError = !bookingId ? "Missing booking id in the return URL." : error;

  return (
    <div className="container-page grid min-h-[65vh] place-items-center py-14">
      <div className="w-full max-w-xl">
        <div className="card-surface overflow-hidden text-center">
          <div className={`${paid ? "bg-success" : "bg-primary"} px-6 py-8 text-white`}>
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-white/15">
              {loading ? (
                <Loader2 className="size-8 animate-spin" />
              ) : paid ? (
                <BadgeCheck className="size-10" />
              ) : (
                <CreditCard className="size-9" />
              )}
            </span>
            <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
              {paid ? "Payment successful!" : "Payment received — confirming…"}
            </h1>
            <p className="mt-2 text-sm text-white/85">
              {paid
                ? "Your booking is confirmed and the owner has been notified."
                : "We are verifying this transaction with Stripe. This usually takes a moment."}
            </p>
          </div>

          <div className="p-6 text-left">
            {finalError && (
              <div className="ui-alert ui-alert-warning mb-4 text-xs">
                <span>{finalError}</span>
                <button
                  type="button"
                  className="ui-button ui-button-xs"
                  onClick={() => setAttempt((a) => a + 1)}
                  disabled={loading}
                >
                  Retry verification
                </button>
              </div>
            )}

            {booking ? (
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="opacity-60">Equipment</dt>
                  <dd className="truncate font-bold">{booking.equipmentName}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="flex items-center gap-1.5 opacity-60">
                    <CalendarDays className="size-4" /> Rental period
                  </dt>
                  <dd className="font-bold">
                    {formatShortDate(booking.startDate)} → {formatShortDate(booking.endDate)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="opacity-60">Quantity</dt>
                  <dd className="font-bold">{booking.quantity}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="opacity-60">Total paid</dt>
                  <dd className="text-primary text-xl font-black">{formatCurrency(booking.totalAmount)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="opacity-60">Status</dt>
                  <dd className="flex gap-2">
                    <span className="ui-badge ui-badge-sm capitalize ui-badge-outline">{booking.status}</span>
                    <span
                      className={`ui-badge ui-badge-sm capitalize ${
                        paid ? "ui-badge-success" : "ui-badge-warning"
                      }`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="opacity-60">Booking ID</dt>
                  <dd className="font-mono text-xs opacity-70">{booking._id}</dd>
                </div>
                {booking.transactionId && (
                  <div className="flex items-center justify-between gap-4">
                    <dt className="opacity-60">Transaction ID</dt>
                    <dd className="max-w-56 truncate font-mono text-xs opacity-70">
                      {booking.transactionId}
                    </dd>
                  </div>
                )}
              </dl>
            ) : loading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <span className="ui-loading ui-loading-spinner text-primary" />
                <p className="text-sm opacity-60">Fetching your booking…</p>
              </div>
            ) : (
              <p className="py-4 text-center text-sm opacity-60">
                No booking details to show for this link.
              </p>
            )}

            <div className="mt-6 grid gap-3">
              <Link href="/dashboard/customer" className="ui-button ui-button-primary font-bold">
                <PackageCheck className="size-4" /> View my bookings
              </Link>
              <Link href="/all-equipment" className="ui-button ui-button-ghost ui-button-sm">
                Keep browsing equipment
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard>
        <PaymentSuccessInner />
      </AuthGuard>
    </Suspense>
  );
}
