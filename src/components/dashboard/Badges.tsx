import type { BookingStatus, EquipmentStatus, PaymentStatus } from "@/lib/types";

const BOOKING_TONE: Record<BookingStatus, string> = {
  pending: "ui-badge-warning",
  confirmed: "ui-badge-info",
  completed: "ui-badge-success",
  cancelled: "ui-badge-error",
};

const PAYMENT_TONE: Record<PaymentStatus, string> = {
  unpaid: "ui-badge-warning",
  paid: "ui-badge-success",
  expired: "ui-badge-error",
};

const EQUIPMENT_TONE: Record<EquipmentStatus, string> = {
  pending: "ui-badge-warning",
  approved: "ui-badge-success",
  rejected: "ui-badge-error",
};

/** Booking status capsule — wording and colour stay identical in every table. */
export function StatusBadge({ status }: { status: BookingStatus }) {
  return <span className={`ui-badge ui-badge-sm capitalize ${BOOKING_TONE[status] ?? "ui-badge-ghost"}`}>{status}</span>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`ui-badge ui-badge-sm capitalize ui-badge-outline ${PAYMENT_TONE[status] ?? "ui-badge-ghost"}`}>
      {status}
    </span>
  );
}

export function EquipmentStatusBadge({ status }: { status: EquipmentStatus }) {
  return <span className={`ui-badge ui-badge-sm capitalize ${EQUIPMENT_TONE[status]}`}>{status}</span>;
}

export function RoleBadge({ role }: { role: string }) {
  const tone =
    role === "admin" ? "ui-badge-error" : role === "owner" ? "ui-badge-info" : "ui-badge-primary";
  return <span className={`ui-badge ui-badge-sm capitalize ${tone}`}>{role}</span>;
}
