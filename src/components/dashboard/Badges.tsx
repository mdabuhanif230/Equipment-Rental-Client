import type { BookingStatus, EquipmentStatus, PaymentStatus } from "@/lib/types";

const BOOKING_TONE: Record<BookingStatus, string> = {
  pending: "badge-warning",
  confirmed: "badge-info",
  completed: "badge-success",
  cancelled: "badge-error",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  unpaid: "badge-warning",
  paid: "badge-success",
  expired: "badge-error",
};

const EQUIPMENT_TONE: Record<EquipmentStatus, string> = {
  pending: "badge-warning",
  approved: "badge-success",
  rejected: "badge-error",
};

/** Booking status capsule — wording and colour stay identical in every table. */
export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`badge badge-sm capitalize ${BOOKING_TONE[status] ?? "badge-ghost"}`}>{status}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`badge badge-sm capitalize badge-outline ${PAYMENT_TONE[status] ?? "badge-ghost"}`}>
      {status}
    </span>
  );
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return <span className={`badge badge-sm capitalize ${EQUIPMENT_TONE[status]}`}>{status}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "admin" ? "badge-error" : role === "owner" ? "badge-info" : "badge-primary";
  return <span className={`badge badge-sm capitalize ${tone}`}>{role}</span>;
}
