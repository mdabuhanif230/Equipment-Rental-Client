"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  CalendarCheck,
  CircleDollarSign,
  Clock,
  Heart,
  PackageCheck,
} from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import BookingsTable from "@/components/dashboard/BookingsTable";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Booking, CustomerStats } from "@/lib/types";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#0284c7",
  completed: "#15803d",
  cancelled: "#dc2626",
};

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [recent, setRecent] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      api.get<CustomerStats>("/stats/customer"),
      api.get<{ items: Booking[] }>("/bookings/my?limit=5"),
    ])
      .then(([statsData, bookingsData]) => {
        if (!active) return;
        setStats(statsData);
        setRecent(bookingsData.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const distribution = ["pending", "confirmed", "completed", "cancelled"].map((status) => ({
    name: status,
    value: recent.filter((b) => b.status === status).length,
  })).filter((d) => d.value > 0);

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Your rentals, favorites and spending at a glance."
        actions={
          <Link href="/all-equipment" className="ui-button ui-button-primary ui-button-sm font-semibold">
            Rent something new
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon={PackageCheck} label="Total rentals" value={stats?.totalRentals ?? (loading ? "…" : 0)} />
        <StatCard icon={Clock} label="Active now" tone="info" value={stats?.activeRentals ?? (loading ? "…" : 0)} />
        <StatCard icon={CalendarCheck} label="Completed" tone="success" value={stats?.completedRentals ?? (loading ? "…" : 0)} />
        <StatCard icon={Heart} label="Favorites" tone="secondary" value={stats?.favorites ?? (loading ? "…" : 0)} />
        <StatCard
          icon={CircleDollarSign}
          label="Total spent"
          value={stats ? formatCurrency(stats.totalSpent) : loading ? "…" : formatCurrency(0)}
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Recent bookings</h2>
            <Link href="/dashboard/customer/bookings" className="ui-button ui-button-ghost ui-button-xs font-semibold">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="table-surface h-56 animate-pulse bg-base-200" />
          ) : recent.length === 0 ? (
            <div className="card-surface p-8 text-center">
              <p className="text-sm opacity-70">You have not rented anything yet.</p>
              <Link href="/all-equipment" className="ui-button ui-button-primary ui-button-sm mt-4">
                Browse equipment
              </Link>
            </div>
          ) : (
            <BookingsTable variant="customer" items={recent} />
          )}
        </section>

        <ChartCard title="Booking status mix" subtitle="Across your five most recent rentals">
          {distribution.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm opacity-60">
              No bookings to chart yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                >
                  {distribution.map((entry) => (
                    <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
