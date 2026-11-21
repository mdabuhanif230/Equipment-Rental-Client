"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, CreditCard, XCircle } from "lucide-react";
import { PaymentBadge, StatusBadge } from "@/components/dashboard/Badges";
import { formatCurrency, formatShortDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

type Variant = "customer" | "owner" | "admin";

interface BookingsTableProps {
  variant: Variant;
  items: Booking[];
  onCancel?: (id: string) => void;
  onPay?: (id: string) => void;
  onComplete?: (id: string) => void;
  busyId?: string | null;
}

const HEADERS: Record<Variant, string[]> = {
  customer: ["Equipment", "Start date", "End date", "Booking date", "Qty", "Total", "Payment", "Status", "Actions"],
  owner: ["Customer", "Equipment", "Rental duration", "Required qty", "Booking amount", "Payment", "Status", "Actions"],
  admin: ["Booking", "Customer", "Owner", "Equipment", "Rental duration", "Booking amount", "Payment", "Status", "Actions"],
};

/** Bookings table with the exact columns each role needs (assignment spec). */
export default function BookingsTable({
  variant,
  items,
  onCancel,
  onPay,
  onComplete,
  busyId,
}: BookingsTableProps) {
  const period = (b: Booking) => (
    <span className="flex items-center gap-1.5 whitespace-nowrap text-xs">
      <CalendarDays className="size-3.5 opacity-60" />
      {formatShortDate(b.startDate)} → {formatShortDate(b.endDate)}
    </span>
  );

  return (
    <div className="table-surface scroll-thin overflow-x-auto">
      <table className="ui-table ui-table-sm">
        <thead>
          <tr className="bg-base-200 text-xs uppercase tracking-wide">
            {HEADERS[variant].map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((b) => {
            const unpaid = b.status === "pending" && b.paymentStatus === "unpaid";

            if (variant === "customer") {
              return (
                <tr key={b._id}>
                  <td className="min-w-44">
                    <p className="font-bold">{b.equipmentName}</p>
                    <p className="font-mono text-xs opacity-50">#{b._id.slice(-6)}</p>
                  </td>
                  <td className="whitespace-nowrap text-xs">
                    <CalendarDays className="mr-1 inline size-3.5 opacity-60" />
                    {formatShortDate(b.startDate)}
                  </td>
                  <td className="whitespace-nowrap text-xs">{formatShortDate(b.endDate)}</td>
                  <td className="whitespace-nowrap text-xs opacity-70">{formatShortDate(b.createdAt)}</td>
                  <td className="font-semibold">{b.quantity}</td>
                  <td className="font-black">{formatCurrency(b.totalAmount)}</td>
                  <td><PaymentBadge status={b.paymentStatus} /></td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    <div className="flex flex-wrap gap-1.5">
                      {unpaid && onPay && (
                        <button
                          type="button"
                          className="ui-button ui-button-primary ui-button-xs gap-1"
                          disabled={busyId === b._id}
                          onClick={() => onPay(b._id)}
                        >
                          <CreditCard className="size-3.5" /> Pay
                        </button>
                      )}
                      {unpaid && onCancel && (
                        <button
                          type="button"
                          className="ui-button ui-button-outline ui-button-error ui-button-xs gap-1"
                          disabled={busyId === b._id}
                          onClick={() => onCancel(b._id)}
                        >
                          <XCircle className="size-3.5" /> Cancel
                        </button>
                      )}
                      {!unpaid && (
                        <Link href={`/equipment/${b.equipmentId}`} className="ui-button ui-button-ghost ui-button-xs">
                          View
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              );
            }

            if (variant === "owner") {
              const completable = b.status === "confirmed" && b.paymentStatus === "paid";
              return (
                <tr key={b._id}>
                  <td>
                    <p className="font-bold">{b.customerName}</p>
                    <p className="truncate text-xs opacity-55">{b.customerEmail}</p>
                  </td>
                  <td className="min-w-40">
                    <p className="font-semibold">{b.equipmentName}</p>
                    <p className="text-xs opacity-55">{b.phone}</p>
                  </td>
                  <td>{period(b)}</td>
                  <td className="font-semibold">{b.quantity}</td>
                  <td className="font-black">{formatCurrency(b.totalAmount)}</td>
                  <td><PaymentBadge status={b.paymentStatus} /></td>
                  <td><StatusBadge status={b.status} /></td>
                  <td>
                    {completable && onComplete ? (
                      <button
                        type="button"
                        className="ui-button ui-button-success ui-button-xs gap-1 text-success-content"
                        disabled={busyId === b._id}
                        onClick={() => onComplete(b._id)}
                      >
                        <CheckCircle2 className="size-3.5" /> Mark completed
                      </button>
                    ) : (
                      <span className="text-xs opacity-50">—</span>
                    )}
                  </td>
                </tr>
              );
            }

            return (
              <tr key={b._id}>
                <td className="font-mono text-xs">#{b._id.slice(-8)}</td>
                <td>
                  <p className="font-bold">{b.customerName}</p>
                  <p className="truncate text-xs opacity-55">{b.customerEmail}</p>
                </td>
                <td className="min-w-40">
                  <p className="font-semibold">{b.ownerName || "—"}</p>
                  {b.ownerEmail && <p className="truncate text-xs opacity-55">{b.ownerEmail}</p>}
                </td>
                <td className="min-w-40 font-semibold">{b.equipmentName}</td>
                <td>{period(b)}</td>
                <td className="font-black">{formatCurrency(b.totalAmount)}</td>
                <td><PaymentBadge status={b.paymentStatus} /></td>
                <td><StatusBadge status={b.status} /></td>
                <td>
                  {unpaid && onCancel ? (
                    <button
                      type="button"
                      className="ui-button ui-button-outline ui-button-error ui-button-xs gap-1"
                      disabled={busyId === b._id}
                      onClick={() => onCancel(b._id)}
                    >
                      <XCircle className="size-3.5" /> Cancel
                    </button>
                  ) : b.status === "confirmed" && b.paymentStatus === "paid" && onComplete ? (
                    <button
                      type="button"
                      className="ui-button ui-button-success ui-button-xs gap-1 text-success-content"
                      disabled={busyId === b._id}
                      onClick={() => onComplete(b._id)}
                    >
                      <CheckCircle2 className="size-3.5" /> Complete
                    </button>
                  ) : (
                    <span className="text-xs opacity-50">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
