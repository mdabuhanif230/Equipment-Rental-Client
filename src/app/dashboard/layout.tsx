"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Role } from "@/lib/types";

/**
 * Guards every /dashboard/* route and frames it with the role-aware sidebar.
 * The URL decides which roles are allowed, so an owner cannot open the admin area.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const allow = useMemo<Role[] | undefined>(() => {
    if (pathname.startsWith("/dashboard/admin")) return ["admin"];
    if (pathname.startsWith("/dashboard/owner")) return ["owner"];
    if (pathname.startsWith("/dashboard/customer")) return ["customer"];
    return undefined;
  }, [pathname]);

  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard allow={allow}>
        <DashboardShell>{children}</DashboardShell>
      </AuthGuard>
    </Suspense>
  );
}
