"use client";

import { Suspense, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Check,
  Copy,
  Eye,
  EyeOff,
  Fingerprint,
  ImagePlus,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  MapPin,
  Phone,
  Save,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import AuthGuard from "@/components/AuthGuard";
import UserAvatar from "@/components/UserAvatar";
import { useAuth, validatePassword } from "@/context/AuthContext";
import { authClient } from "@/lib/auth-client";
import { formatShortDate } from "@/lib/format";
import { uploadImageToImgBB } from "@/lib/upload-image";

type Tab = "personal" | "photo" | "security";

function ProfileInner() {
  const { user, updateProfile, refreshUser } = useAuth();
  const router = useRouter();
  // AuthGuard only renders this once the session resolved, so seeding from `user` is safe
  const [form, setForm] = useState(() => ({
    name: user?.name || "",
    email: user?.email || "",
    photoURL: user?.photoURL || "",
    phone: user?.phone || "",
    address: user?.address || "",
  }));
  const [tab, setTab] = useState<Tab>("personal");
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [password, setPassword] = useState({ current: "", next: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const photoFileInput = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const completionFields = [form.name, form.email, form.phone, form.address, form.photoURL];
  const completion = Math.round(
    (completionFields.filter((value) => value.trim()).length / completionFields.length) * 100,
  );

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
      // Use the server's copy as the source of truth, so a refresh shows what was saved.
      const saved = await refreshUser();
      setForm({
        name: saved.name,
        email: saved.email,
        photoURL: saved.photoURL || "",
        phone: saved.phone || "",
        address: saved.address || "",
      });
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update your profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    setForm({
      name: user.name,
      email: user.email,
      photoURL: user.photoURL || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    toast.success("Unsaved changes discarded.");
  };

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || saving) return;

    setUploadingPhoto(true);
    try {
      const photoURL = await uploadImageToImgBB(file);
      // Only update the form preview. Nothing is saved until "Save changes" is clicked.
      setForm((current) => ({ ...current, photoURL }));
      toast.success("Photo selected. Click Save changes to apply it.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload your photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = () => {
    if (!form.photoURL || uploadingPhoto || saving) return;
    // Also only a preview change — press "Save changes" to persist it.
    setForm((current) => ({ ...current, photoURL: "" }));
    toast.success("Photo removed from the preview. Click Save changes to apply it.");
  };

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password.current) {
      toast.error("Enter your current password.");
      return;
    }
    const problem = validatePassword(password.next);
    if (problem) {
      toast.error(problem);
      return;
    }
    if (password.next !== password.confirm) {
      toast.error("New passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      const result = await authClient.changePassword({
        currentPassword: password.current,
        newPassword: password.next,
        revokeOtherSessions: true,
      });
      if (result.error) throw new Error(result.error.message || "Could not change your password.");
      setPassword({ current: "", next: "", confirm: "" });
      toast.success("Password updated. Other devices were signed out.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change your password.");
    } finally {
      setChangingPassword(false);
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

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(user._id);
      toast.success("Account ID copied.");
    } catch {
      toast.error("Could not copy the account ID.");
    }
  };

  const field = "ui-input ui-input-bordered w-full";
  const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider opacity-60";
  const tabs: { key: Tab; label: string; icon: typeof UserRound }[] = [
    { key: "personal", label: "Personal info", icon: UserRound },
    { key: "photo", label: "Photo", icon: Camera },
    { key: "security", label: "Security", icon: LockKeyhole },
  ];

  return (
    <div className="container-page max-w-6xl py-8 lg:py-12">
      <button
        type="button"
        onClick={handleBack}
        className="group mb-6 inline-flex items-center gap-2.5 rounded-full border border-base-content/10 bg-base-100/70 px-4 py-2 text-xs font-bold uppercase tracking-wider opacity-70 transition hover:border-primary/40 hover:text-primary hover:opacity-100"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Back
      </button>

      {/* cover */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-secondary shadow-xl">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-16 -top-24 size-72 rounded-full border-[28px] border-primary-content/10" />
          <div className="absolute -bottom-36 right-32 size-72 rounded-full bg-primary-content/10 blur-3xl" />
          <div className="absolute left-1/3 top-0 h-full w-px bg-primary-content/10" />
        </div>
        <div className="absolute right-8 top-8 hidden text-right sm:block">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary-content/60">
            Member ID
          </p>
          <p className="mt-1 font-mono text-sm font-bold text-primary-content">
            RG-{user._id.slice(-6).toUpperCase()}
          </p>
          <span className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary-content/20 bg-primary-content/10 px-3 py-1.5 text-[11px] font-bold text-primary-content">
            <span className="size-2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]" />
            Active account
          </span>
        </div>
        <div className="relative px-6 pb-20 pt-8 sm:px-10 sm:pb-24">
          <p className="text-[11px] font-black uppercase tracking-[0.25em] text-primary-content/70">
            Account / Settings
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-primary-content sm:text-4xl">
            My Profile
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-primary-content/80">
            Manage the identity your renters and equipment owners see across RentGear.
          </p>
        </div>
      </section>

      <div className="relative -mt-14 grid gap-6 px-1 lg:grid-cols-[290px_minmax(0,1fr)]">
        {/* identity rail */}
        <aside className="flex flex-col gap-4">
          <div className="card-surface p-6 text-center">
            <div
              className="mx-auto w-fit rounded-full p-1 transition-all duration-500"
              style={{
                background: `conic-gradient(var(--color-secondary) ${completion}%, var(--color-base-200) 0)`,
              }}
              title={`Profile ${completion}% complete`}
            >
              <UserAvatar
                name={form.name || user.name}
                photoURL={form.photoURL}
                className="ring-offset-base-100 grid size-28 place-items-center rounded-full text-3xl font-black uppercase text-primary ring-4 ring-white/50"
                imgClassName="size-28 rounded-full object-cover"
              />
            </div>
            <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-secondary">
              <span className="size-1.5 rotate-45 bg-secondary" /> {completion}% complete
            </p>
            <h2 className="mt-3 text-lg font-extrabold leading-tight">{user.name}</h2>
            <p className="mt-1 break-all text-xs opacity-60">{user.email}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="ui-badge ui-badge-primary ui-badge-sm capitalize">{user.role}</span>
              <span className="ui-badge ui-badge-ghost ui-badge-sm">
                <ShieldCheck className="size-3" /> Verified
              </span>
              <span className="ui-badge ui-badge-success ui-badge-sm">Active</span>
            </div>
            <div className="border-base-content/10 mt-5 flex items-center justify-center gap-2 border-t pt-4 text-xs opacity-60">
              <CalendarDays className="size-3.5" />
              Joined {formatShortDate(user.createdAt) || "recently"}
            </div>
          </div>

          <div className="card-surface p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-extrabold">
              <Fingerprint className="size-4 text-primary" /> Account details
            </h3>
            <dl className="space-y-3 text-xs">
              <div className="flex items-center justify-between gap-3">
                <dt className="opacity-55">Account ID</dt>
                <dd className="font-mono opacity-75">{user._id.slice(-8)}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="opacity-55">Role</dt>
                <dd className="font-bold capitalize">{user.role}</dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="opacity-55">Sign-in</dt>
                <dd className="font-semibold">{user.provider === "google" ? "Google" : "Password"}</dd>
              </div>
            </dl>
            <div className="mt-5 rounded-lg border border-dashed border-primary/25 bg-base-200/60 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold tracking-[0.2em] opacity-60">
                  RG-{user._id.slice(-8).toUpperCase()}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary hover:underline"
                >
                  <Copy className="size-3" /> Copy
                </button>
              </div>
              <div
                aria-hidden
                className="mt-2 h-6 w-full opacity-50"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, var(--color-primary) 0 2px, transparent 2px 5px, var(--color-primary) 5px 6px, transparent 6px 9px)",
                }}
              />
              <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] opacity-45">
                RentGear member card
              </p>
            </div>
            <div className="bg-primary/5 mt-4 flex items-start gap-2.5 rounded-lg p-3 text-xs leading-relaxed opacity-75">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>Role changes are handled by an administrator only.</span>
            </div>
          </div>
        </aside>

        {/* settings card */}
        <section className="card-surface overflow-hidden">
          <div className="border-base-content/10 flex gap-1 overflow-x-auto border-b px-3 pt-3 sm:px-5">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={tab === key}
                onClick={() => setTab(key)}
                className={`flex shrink-0 items-center gap-2 rounded-t-xl px-4 py-3 text-sm font-bold transition ${
                  tab === key
                    ? "bg-primary/10 text-primary shadow-[inset_0_-2px_0_var(--color-primary)]"
                    : "opacity-60 hover:bg-base-200/60 hover:opacity-100"
                }`}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          {tab === "security" ? (
            <form onSubmit={handlePasswordSubmit} className="p-6 sm:p-8">
              <div className="mb-6 flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-warning/15 text-warning">
                  <KeyRound className="size-5" />
                </span>
                <div>
                  <h3 className="text-lg font-extrabold">Change password</h3>
                  <p className="mt-1 text-xs leading-relaxed opacity-60">
                    Use at least 6 characters with one uppercase and one lowercase letter. Other signed-in
                    devices will be signed out.
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="ui-form-control sm:col-span-2">
                  <span className={labelClass}>Current password</span>
                  <label className={field}>
                    <LockKeyhole className="size-4 opacity-60" />
                    <input
                      className="grow"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="Your current password"
                      value={password.current}
                      onChange={(e) => setPassword((p) => ({ ...p, current: e.target.value }))}
                      required
                    />
                  </label>
                </label>
                <label className="ui-form-control">
                  <span className={labelClass}>New password</span>
                  <label className={field}>
                    <KeyRound className="size-4 opacity-60" />
                    <input
                      className="grow"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Min. 6 characters"
                      value={password.next}
                      onChange={(e) => setPassword((p) => ({ ...p, next: e.target.value }))}
                      required
                    />
                  </label>
                </label>
                <label className="ui-form-control">
                  <span className={labelClass}>Confirm new password</span>
                  <label className={field}>
                    <KeyRound className="size-4 opacity-60" />
                    <input
                      className="grow"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat new password"
                      value={password.confirm}
                      onChange={(e) => setPassword((p) => ({ ...p, confirm: e.target.value }))}
                      required
                    />
                  </label>
                </label>
              </div>
              <div className="border-base-content/10 mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="ui-button ui-button-ghost ui-button-sm gap-2"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  {showPassword ? "Hide passwords" : "Show passwords"}
                </button>
                <button
                  type="submit"
                  className="ui-button ui-button-primary ui-button-sm gap-2 font-bold"
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <Check className="size-4" />
                  )}
                  Update password
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 sm:p-8">
              {tab === "personal" ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-extrabold">Personal information</h3>
                    <p className="mt-1 text-xs opacity-60">
                      These details appear on bookings and handover notes.
                    </p>
                  </div>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="ui-form-control">
                      <span className={labelClass}>Full name</span>
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
                      <span className={labelClass}>Email address</span>
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
                      <span className="mt-1.5 block text-xs opacity-55">
                        Your sign-in address will be updated as well.
                      </span>
                    </label>
                    <label className="ui-form-control">
                      <span className={labelClass}>Phone number</span>
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
                      <span className={labelClass}>Address</span>
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
                </>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-extrabold">Profile photo</h3>
                    <p className="mt-1 text-xs opacity-60">
                      A clear photo helps owners and renters recognise you.
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-base-content/15 bg-base-200/40 p-6 sm:flex-row sm:p-8">
                    <UserAvatar
                      name={form.name || user.name}
                      photoURL={form.photoURL}
                      className="ring-primary/20 ring-offset-base-100 grid size-24 shrink-0 place-items-center rounded-full text-2xl font-black uppercase text-primary ring-4 ring-offset-2"
                      imgClassName="size-24 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                      <p className="text-sm font-bold">Choose a photo from your device</p>
                      <p className="mt-1 text-xs leading-relaxed opacity-60">
                        JPG, PNG or WebP up to 32 MB. Uploads are hosted by ImgBB. Nothing is saved until you
                        click Save changes.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
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
                          {uploadingPhoto ? "Uploading..." : "Choose from device"}
                        </button>
                        {form.photoURL && (
                          <button
                            type="button"
                            className="ui-button ui-button-ghost ui-button-sm gap-2 text-error"
                            onClick={handleRemovePhoto}
                            disabled={uploadingPhoto || saving}
                          >
                            <Trash2 className="size-4" /> Remove photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <label className="ui-form-control mt-5 block">
                    <span className={labelClass}>Or paste a photo URL</span>
                    <label className={field}>
                      <Camera className="size-4 opacity-60" />
                      <input
                        className="grow"
                        aria-label="Profile photo URL"
                        placeholder="https://example.com/photo.jpg"
                        value={form.photoURL}
                        onChange={(e) => setForm((f) => ({ ...f, photoURL: e.target.value }))}
                      />
                    </label>
                  </label>
                </>
              )}

              <div className="border-base-content/10 mt-7 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
                <p className="text-xs opacity-55">
                  {dirty ? "You have unsaved changes." : "Everything is up to date."}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDiscard}
                    disabled={!dirty || saving}
                    className="ui-button ui-button-ghost ui-button-sm"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    className="ui-button ui-button-primary ui-button-sm gap-2 font-bold"
                    disabled={saving || !dirty}
                  >
                    {saving ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                      <Save className="size-4" />
                    )}
                    Save changes
                  </button>
                </div>
              </div>
            </form>
          )}
        </section>
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
