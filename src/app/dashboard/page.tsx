"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

const HOME: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

/**
 * Landing route for the Google sign-in callback and for the Navbar "Dashboard"
 * link. Sends each role to its own overview instead of rendering a 404.
 */
export default function DashboardIndexPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? HOME[user.role] : "/login");
  }, [loading, user, router]);

  return (
    <div className="grid min-h-[60vh] place-items-center">
      <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
    </div>
  );
}
