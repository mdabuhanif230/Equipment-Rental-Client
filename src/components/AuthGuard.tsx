"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

/**
 * Client-side route guard.
 *
 * Waits for the auth bootstrap instead of redirecting immediately, so a logged-in
 * user refreshing a private page never gets bounced to /login.
 */
export default function AuthGuard({
  children,
  allow,
}: {
  children: ReactNode;
  /** Optional role whitelist, e.g. ["admin"] */
  allow?: Role[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      const next = encodeURIComponent(`${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`);
      router.replace(`/login?next=${next}`);
      return;
    }
    if (allow && !allow.includes(user.role)) {
      const home =
        user.role === "admin" ? "/dashboard/admin" : user.role === "owner" ? "/dashboard/owner" : "/dashboard/customer";
      router.replace(home);
    }
  }, [user, loading, router, pathname, searchParams, allow]);

  if (loading || !user || (allow && !allow.includes(user.role))) {
    return (
      <div className="grid min-h-[70vh] place-items-center">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary" />
          <p className="text-sm font-medium opacity-60">Checking your session…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
