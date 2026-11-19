"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, CalendarCheck, PackagePlus, Wrench } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import StatCard from "@/components/dashboard/StatCard";
import ChartCard from "@/components/dashboard/ChartCard";
import BookingsTable from "@/components/dashboard/BookingsTable";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Booking, OwnerStats } from "@/lib/types";

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([
      api.get<OwnerStats>("/stats/owner"),
      api.get<{ items: Booking[] }>("/bookings/owner?limit=5"),
    ])
      .then(([statsData, bookingsData]) => {
        if (!active) return;
        setStats(statsData);
        setBookings(bookingsData.items);
      })
      .catch(() => undefined)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user]);

  const chartData = stats?.monthlyEarnings.map((m) => ({ ...m, month: m.month.slice(5) })) ?? [];

  return (
    <div>
      <PageHeader
        title={`Owner dashboard`}
        subtitle="Earnings, rentals and listings that belong to you."
        actions={
          <>
            <Link href="/dashboard/owner/equipment" className="btn btn-outline btn-sm font-semibold">
              Manage equipment
            </Link>
            <Link href="/dashboard/owner/bookings" className="btn btn-primary btn-sm font-semibold">
              All bookings
            </Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Wrench} label="Total listed" value={stats?.totalListed ?? (loading ? "…" : 0)} />
        <StatCard
          icon={CalendarCheck}
          label="Completed rentals"
          tone="success"
          value={stats?.completedRentals ?? (loading ? "…" : 0)}
        />
        <StatCard
          icon={Banknote}
          label="Total earnings"
          tone="secondary"
          value={stats ? formatCurrency(stats.totalEarnings) : loading ? "…" : formatCurrency(0)}
        />
        <StatCard
          icon={PackagePlus}
          label="Approval queue"
          tone="info"
          value="—"
          hint="Edited listings re-enter review"
        />
      </div>

      <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <ChartCard title="Monthly earnings" subtitle="Aggregated from completed Stripe payments">
          {chartData.length === 0 ? (
            <div className="grid h-full place-items-center text-center text-sm opacity-60">
              Earnings appear after your first completed rental.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="earn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0d7a6f" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#0d7a6f" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Area type="monotone" dataKey="earnings" stroke="#0d7a6f" strokeWidth={2.5} fill="url(#earn)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-extrabold">Latest bookings</h2>
            <Link href="/dashboard/owner/bookings" className="btn btn-ghost btn-xs font-semibold">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="table-surface h-72 animate-pulse bg-base-200" />
          ) : bookings.length === 0 ? (
            <div className="card-surface p-6 text-center text-sm opacity-70">
              No bookings yet — approved listings start earning as soon as customers book them.
            </div>
          ) : (
            <BookingsTable variant="owner" items={bookings} />
          )}
        </section>
      </div>
    </div>
  );
}
