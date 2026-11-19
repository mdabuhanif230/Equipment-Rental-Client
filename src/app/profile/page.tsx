"use client";

import { Suspense, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Camera, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { formatShortDate } from "@/lib/format";

function ProfileInner() {
  const { user, updateProfile } = useAuth();
  // AuthGuard only renders this once the session resolved, so seeding from `user` is safe
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    photoURL: user?.photoURL || "",
    phone: user?.phone || "",
    address: user?.address || "",
  }));
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const dirty =
    form.name !== (user.name || "") ||
    form.photoURL !== (user.photoURL || "") ||
    form.phone !== (user.phone || "") ||
    form.address !== (user.address || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        photoURL: form.photoURL.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const field = "input input-bordered input-sm w-full";

  return (
    <div className="container-page max-w-5xl py-10 lg:py-14">
      <header className="mb-8">
        <span className="eyebrow">Account</span>
        <h1 className="section-title mt-2">My Profile</h1>
        <p className="section-subtitle mt-2">
          Your name, photo, phone and address are shared with bookings and owner handovers.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        {/* identity card */}
        <aside className="card-surface flex flex-col items-center gap-3 p-6 text-center">
          <span className="avatar">
            <span className="ring-primary ring-offset-base-100 grid w-24 place-items-center rounded-full ring-3 ring-offset-2 text-3xl font-black uppercase text-primary">
              {form.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={form.photoURL}
                  alt={form.name || user.name}
                  className="h-24 w-24 rounded-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                (form.name || user.name).charAt(0)
              )}
            </span>
          </span>
          <div>
            <p className="text-lg font-extrabold">{user.name}</p>
            <p className="truncate text-sm opacity-65">{user.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="badge badge-primary badge-sm capitalize">{user.role}</span>
            <span className="badge badge-ghost badge-sm capitalize">
              <ShieldCheck className="size-3" /> {user.role === "admin" ? "verified" : "member"}
            </span>
          </div>
          <p className="text-xs opacity-55">
            Joined {formatShortDate(user.createdAt) || "recently"}
          </p>
        </aside>

        {/* editable details */}
        <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-4 p-6">
          <h2 className="font-bold">Profile details</h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Full name</span>
              <label className={field}>
                <UserRound className="size-4 opacity-60" />
                <input
                  className="grow"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                  maxLength={80}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Email address</span>
              <label className={`${field} cursor-not-allowed opacity-70`}>
                <Mail className="size-4 opacity-60" />
                <input className="grow" value={user.email} readOnly disabled aria-readonly />
              </label>
              <span className="label-text-alt text-xs opacity-55">
                Email cannot be changed after registration.
              </span>
            </label>

            <label className="form-control sm:col-span-2">
              <span className="label py-1 text-xs font-semibold opacity-70">Photo URL</span>
              <label className={field}>
                <Camera className="size-4 opacity-60" />
                <input
                  className="grow"
                  placeholder="https://i.ibb.co/your-avatar.png"
                  value={form.photoURL}
                  onChange={(e) => setForm((f) => ({ ...f, photoURL: e.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Phone number</span>
              <label className={field}>
                <Phone className="size-4 opacity-60" />
                <input
                  className="grow"
                  placeholder="+880 1700-000000"
                  value={form.phone}
                  maxLength={30}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </label>
            </label>

            <label className="form-control">
              <span className="label py-1 text-xs font-semibold opacity-70">Address</span>
              <label className={field}>
                <MapPin className="size-4 opacity-60" />
                <input
                  className="grow"
                  placeholder="House 12, Road 5, Dhaka"
                  value={form.address}
                  maxLength={300}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                />
              </label>
            </label>
          </div>

          <div className="border-base-content/10 mt-2 flex items-center justify-between gap-3 border-t pt-4">
            <p className="text-xs opacity-60">
              Role changes are handled by an administrator only.
            </p>
            <button
              type="submit"
              className="btn btn-primary btn-sm gap-2 font-bold"
              disabled={saving || !dirty}
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard>
        <ProfileInner />
      </AuthGuard>
    </Suspense>
  );
}
