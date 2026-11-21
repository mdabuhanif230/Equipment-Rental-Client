"use client";

import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Search, ShieldAlert } from "lucide-react";
import PageHeader from "@/components/dashboard/PageHeader";
import { RoleBadge } from "@/components/dashboard/Badges";
import EmptyState from "@/components/EmptyState";
import Pagination from "@/components/Pagination";
import { api } from "@/lib/api";
import { formatShortDate } from "@/lib/format";
import { useAuth } from "@/context/AuthContext";
import type { Paginated, Role, User } from "@/lib/types";

const ROLES: Role[] = ["customer", "owner", "admin"];

export default function AdminUsersPage() {
  const { user: me } = useAuth();
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<Role | "">("");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (role) params.set("role", role);
    if (appliedSearch) params.set("search", appliedSearch);

    api
      .get<Paginated<User>>(`/admin/users?${params}`)
      .then((res) => setData(res))
      .catch((err: unknown) =>
        toast.error(err instanceof Error ? err.message : "Could not load users."),
      )
      .finally(() => setLoading(false));
  }, [page, role, appliedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const changeRole = async (id: string, nextRole: Role) => {
    setBusyId(id);
    try {
      await api.patch<{ user: User }>(`/admin/users/${id}/role`, { role: nextRole });
      toast.success(`Role updated to ${nextRole}.`);
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not change the role.");
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Promote customers to owners, or grant admin access. Roles are enforced server-side."
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <label className="ui-input ui-input-bordered ui-input-sm flex min-w-56 flex-1 items-center gap-2">
          <Search className="size-4 opacity-60" />
          <input
            type="search"
            className="grow"
            placeholder="Search name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                setPage(1);
                setAppliedSearch(search.trim());
              }
            }}
          />
        </label>
        <button
          type="button"
          className="ui-button ui-button-primary ui-button-sm font-semibold"
          onClick={() => {
            setPage(1);
            setAppliedSearch(search.trim());
          }}
        >
          Search
        </button>

        <select
          className="ui-select ui-select-bordered ui-select-sm"
          value={role}
          onChange={(e) => {
            setPage(1);
            setRole(e.target.value as Role | "");
          }}
        >
          <option value="">All roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="table-surface h-96 animate-pulse bg-base-200" />
      ) : !data || data.items.length === 0 ? (
        <EmptyState
          icon={<Search className="size-6" />}
          title="No users found"
          description="No account matches that role filter or search term."
        />
      ) : (
        <>
          <div className="table-surface scroll-thin overflow-x-auto">
            <table className="ui-table ui-table-sm">
              <thead>
                <tr className="bg-base-200 text-xs uppercase tracking-wide">
                  <th>User</th>
                  <th>Role</th>
                  <th>Change role</th>
                  <th>Phone</th>
                  <th>Provider</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((u) => (
                  <tr key={u._id}>
                    <td className="min-w-56">
                      <p className="flex items-center gap-2 font-bold">
                        {u.name}
                        {me && u._id === me._id && (
                          <span className="ui-badge ui-badge-ghost ui-badge-xs">you</span>
                        )}
                      </p>
                      <p className="truncate text-xs opacity-55">{u.email}</p>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td>
                      <select
                        className="ui-select ui-select-bordered ui-select-xs"
                        value={u.role}
                        disabled={busyId === u._id || (me ? u._id === me._id : false)}
                        onChange={(e) => changeRole(u._id, e.target.value as Role)}
                        aria-label={`Change role for ${u.name}`}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-xs">{u.phone || "—"}</td>
                    <td className="text-xs capitalize opacity-70">{u.provider ?? "password"}</td>
                    <td className="whitespace-nowrap text-xs">{formatShortDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={data.page} pages={data.pages} onChange={setPage} busy={loading} />

          <p className="mt-4 flex items-start gap-2 text-xs opacity-60">
            <ShieldAlert className="mt-0.5 size-4 shrink-0 text-primary" />
            Role changes take effect immediately: the JWT only proves identity, while every
            protected endpoint re-reads the role from MongoDB.
          </p>
        </>
      )}
    </div>
  );
}
