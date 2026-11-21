"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ExternalLink, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import UserAvatar from "@/components/UserAvatar";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

const NAV: Record<Role, { href: string; label: string }[]> = {
  customer: [
    { href: "/dashboard/customer", label: "Overview" },
    { href: "/dashboard/customer/bookings", label: "My Bookings" },
    { href: "/dashboard/customer/favorites", label: "Favorites" },
    { href: "/profile", label: "Profile" },
  ],
  owner: [
    { href: "/dashboard/owner", label: "Overview" },
    { href: "/dashboard/owner/add-equipment", label: "Add Equipment" },
    { href: "/dashboard/owner/equipment", label: "My Equipment" },
    { href: "/dashboard/owner/bookings", label: "Bookings" },
    { href: "/profile", label: "Profile" },
  ],
  admin: [
    { href: "/dashboard/admin", label: "Overview" },
    { href: "/dashboard/admin/users", label: "Users" },
    { href: "/dashboard/admin/equipment", label: "Equipment" },
    { href: "/dashboard/admin/bookings", label: "Bookings" },
    { href: "/profile", label: "Profile" },
  ],
};

const HOME: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

/**
 * Full-width dashboard frame: role-aware sidebar on the left, fluid content on the right.
 * Sub-routes (bookings, equipment, users …) live under /dashboard/<role>/… so every
 * table has its own shareable URL.
 */
export default function DashboardShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const links = NAV[user.role];
  const isActive = (href: string) =>
    href === HOME[user.role] ? pathname === href : pathname.startsWith(href);

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8">
      <div className="grid items-start gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="card-surface sticky top-24 p-4">
          <div className="flex items-center gap-3 border-base-content/10 border-b pb-4">
            <UserAvatar
              name={user.name}
              photoURL={user.photoURL}
              className="bg-primary/15 text-primary grid size-11 shrink-0 place-items-center rounded-full font-black uppercase"
              imgClassName="size-11 rounded-full object-cover"
            />
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold">{user.name}</span>
              <span className="ui-badge ui-badge-primary ui-badge-sm mt-1 capitalize">{user.role}</span>
            </span>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive(link.href)
                    ? "bg-primary text-primary-content"
                    : "hover:bg-base-200 opacity-75 hover:opacity-100"
                }`}
              >
                <LayoutDashboard className="size-4 shrink-0" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-base-content/10 mt-4 flex flex-col gap-1 border-t pt-4">
            <Link href="/" className="ui-button ui-button-ghost ui-button-sm justify-start gap-2.5 font-semibold">
              <ExternalLink className="size-4" /> View site
            </Link>
            <Link href="/profile" className="ui-button ui-button-ghost ui-button-sm justify-start gap-2.5 font-semibold">
              <UserRound className="size-4" /> Account settings
            </Link>
            <button
              type="button"
              onClick={logout}
              className="ui-button ui-button-ghost ui-button-sm justify-start gap-2.5 font-semibold text-error"
            >
              <LogOut className="size-4" /> Logout
            </button>
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
