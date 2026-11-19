"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  CalendarCheck,
  CircleDollarSign,
  Hourglass,
  Package,
  Users,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import type { AdminStats, Role } from "@/lib/types";

const ROLE_COLORS: Record<string, string> = {
  customer: "#0d7a6f",
  owner: "#f59e0b",
  admin: "#dc2626",
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    api
      .get<AdminStats>("/stats/admin")
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : "Could not load statistics.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const bookingData = stats?.monthlyBookings.map((m) => ({ ...m, month: m.month.slice(5) })) ?? [];
  const roleData = (stats?.usersByRole ?? []).map((r) => ({ name: r.role, value: r.count }));

  return (
    <div>
      <PageHeader
        title="Admin dashboard"
        subtitle="Platform-wide KPIs, live MongoDB aggregations and moderation queues."
        actions={
          <>
            <Link href="/dashboard/admin/equipment" className="btn btn-outline btn-sm font-semibold">
              Approval queue
            </Link>
            <Link href="/dashboard/admin/users" className="btn btn-primary btn-sm font-semibold">
              Manage users
            </Link>
          </>
        }
      />

      {error && <div className="alert alert-error mb-5 text-sm">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <StatCard icon={Users} label="Total users" value={stats?.totalUsers ?? (loading ? "…" : 0)} />
        <StatCard icon={Package} label="Total equipment" tone="info" value={stats?.totalEquipment ?? (loading ? "…" : 0)} />
        <StatCard icon={CalendarCheck} label="Total bookings" tone="secondary" value={stats?.totalBookings ?? (loading ? "…" : 0)} />
        <StatCard
          icon={Hourglass}
          label="Pending approvals"
          tone="secondary"
          value={stats?.pendingApprovals ?? (loading ? "…" : 0)}
        />
        <StatCard
          icon={BadgeCheck}
          label="Completed rentals"
          tone="success"
          value={stats?.completedRentals ?? (loading ? "…" : 0)}
        />
        <StatCard
          icon={CircleDollarSign}
          label="Total revenue"
          tone="success"
          value={stats ? formatCurrency(stats.totalRevenue) : loading ? "…" : formatCurrency(0)}
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <ChartCard title="Bookings per month" subtitle="Newest 12 months of booking activity">
          {bookingData.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm opacity-60">
              {loading ? "Loading chart…" : "No bookings recorded yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bookingData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fillOpacity: 0.08 }} />
                <Bar dataKey="bookings" name="Bookings" fill="#0d7a6f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Users by role" subtitle="How the platform is split between roles">
          {roleData.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm opacity-60">
              {loading ? "Loading chart…" : "No users yet."}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {roleData.map((entry) => (
                    <Cell key={entry.name} fill={ROLE_COLORS[entry.name] ?? "#0d7a6f"} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" formatter={(value: Role) => String(value).toUpperCase()} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
