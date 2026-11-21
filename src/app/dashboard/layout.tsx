import type { ReactNode } from "react";
import DashboardFrame from "@/components/dashboard/DashboardFrame";

// Dashboard pages read the session on the client (AuthGuard), so navigation
// into this area is allowed to block. `instant` must live in a Server Component.
export const instant = false;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame>{children}</DashboardFrame>;
}
