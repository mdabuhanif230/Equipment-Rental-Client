"use client";

import { Suspense, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ArrowLeft, Camera, ImagePlus, LoaderCircle, Mail, MapPin, Phone, Save, ShieldCheck, UserRound } from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import { useAuth } from "@/context/AuthContext";
import { formatShortDate } from "@/lib/format";
import { uploadImageToImgBB } from "@/lib/upload-image";

function ProfileInner() {
  const { user, updateProfile } = useAuth();
  const router = useRouter();
  // AuthGuard only renders this once the session resolved, so seeding from `user` is safe
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    phone: user?.phone || "",
    address: user?.address || "",
  }));
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileInput = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const dirty =
    form.name !== (user.name || "") ||
    form.email.toLowerCase() !== (user.email || "").toLowerCase() ||
    form.photoURL !== (user.photoURL || "") ||
    form.phone !== (user.phone || "") ||
    form.address !== (user.address || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address.");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
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

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const photoURL = await uploadImageToImgBB(file);
      setForm((current) => ({ ...current, photoURL }));
      toast.success("Photo uploaded. Save changes to apply it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload your photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleBack = () => {
    const referrer = document.referrer ? new URL(document.referrer) : null;
    const isSafePreviousPage =
      referrer?.origin === window.location.origin &&
      referrer.pathname !== window.location.pathname &&
      referrer.pathname !== "/login" &&
      referrer.pathname !== "/register";

    if (isSafePreviousPage) {
      router.back();
      return;
    }

    const dashboardPath =
      user.role === "admin"
        ? "/dashboard/admin"
        : user.role === "owner"
          ? "/dashboard/owner"
          : "/dashboard/customer";
    router.push(dashboardPath);
  };

  const field = "ui-input ui-input-bordered ui-input-sm w-full";

  return (
    <div className="container-page max-w-5xl py-10 lg:py-14">
      <header className="mb-8">
        <button
          type="button"
          onClick={handleBack}
          className="group mb-7 inline-flex items-center gap-3 rounded-2xl border border-primary/15 bg-base-100/80 p-2 pr-5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-content">
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
          </span>
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-primary/70">
              Navigation
            </span>
            <span className="block text-sm font-bold">Back to previous page</span>
          </span>
        </button>
        <span className="eyebrow">Account</span>
        <h1 className="section-title mt-2">My Profile</h1>
        <p className="section-subtitle mt-2">
          Your name, photo, phone and address are shared with bookings and owner handovers.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[300px_1fr]">
        {/* identity card */}
        <aside className="card-surface flex flex-col items-center gap-3 p-6 text-center">
          <span className="ui-avatar">
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
            <p className="truncate text-sm opacity-65">{form.email || user.email}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="ui-badge ui-badge-primary ui-badge-sm capitalize">{user.role}</span>
            <span className="ui-badge ui-badge-ghost ui-badge-sm capitalize">
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
            <label className="ui-form-control">
              <span className="ui-label py-1 text-xs font-semibold opacity-70">Full name</span>
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

            <label className="ui-form-control">
              <span className="ui-label py-1 text-xs font-semibold opacity-70">Email address</span>
              <label className={field}>
                <Mail className="size-4 opacity-60" />
                <input
                  className="grow"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                  maxLength={120}
                />
              </label>
              <span className="ui-label-text-alt text-xs opacity-55">
                Your sign-in address will be updated as well.
              </span>
            </label>

            <label className="ui-form-control sm:col-span-2">
              <span className="ui-label py-1 text-xs font-semibold opacity-70">Profile photo</span>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  ref={photoFileInput}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Choose a profile photo from this device"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto || saving}
                />
                <button
                  type="button"
                  className="ui-button ui-button-outline ui-button-sm gap-2"
                  onClick={() => photoFileInput.current?.click()}
                  disabled={uploadingPhoto || saving}
                >
                  {uploadingPhoto ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <ImagePlus className="size-4" />
                  )}
                  {uploadingPhoto ? "Uploading photo..." : "Choose from device"}
                </button>
                <span className="text-xs opacity-60">Uploads are hosted by ImgBB.</span>
              </div>
              <label className={field}>
                <Camera className="size-4 opacity-60" />
                <input
                  className="grow"
                  aria-label="Profile photo URL"
                  placeholder="Or paste a photo URL"
                  value={form.photoURL}
                  onChange={(e) => setForm((f) => ({ ...f, photoURL: e.target.value }))}
                />
              </label>
            </label>

            <label className="ui-form-control">
              <span className="ui-label py-1 text-xs font-semibold opacity-70">Phone number</span>
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

            <label className="ui-form-control">
              <span className="ui-label py-1 text-xs font-semibold opacity-70">Address</span>
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
              className="ui-button ui-button-primary ui-button-sm gap-2 font-bold"
              disabled={saving || !dirty}
            >
              {saving ? (
                <span className="ui-loading ui-loading-spinner ui-loading-sm" />
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
          <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
        </div>
      }
    >
      <AuthGuard>
        <ProfileInner />
      </AuthGuard>
    </Suspense>
  );
}
