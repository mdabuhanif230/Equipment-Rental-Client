"use client";

import { Suspense, useMemo, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import DashboardShell from "@/components/dashboard/DashboardShell";
import type { Role } from "@/lib/types";

/**
 * Role-aware frame for every /dashboard/* route. Kept as a Client Component so
 * the server layout can opt the whole area out of instant-navigation validation.
 * The URL decides which roles are allowed, so an owner cannot open the admin area.
 */
export default function DashboardFrame({ children }: { children: ReactNode }) {
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
          <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard allow={allow}>
        <DashboardShell>{children}</DashboardShell>
      </AuthGuard>
    </Suspense>
  );
}
