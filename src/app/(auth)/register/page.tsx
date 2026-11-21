"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, ImagePlus, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth, validatePassword } from "@/context/AuthContext";
import { uploadImageToImgBB } from "@/lib/upload-image";
import type { Role } from "@/lib/types";

const dashboardPath: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

function RegisterInner() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({ name: "", email: "", photo: "", password: "", confirm: "" });
  const [signupRole, setSignupRole] = useState<Exclude<Role, "admin"> | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const photoFileInput = useRef<HTMLInputElement>(null);

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const photoURL = await uploadImageToImgBB(file);
      setForm((current) => ({ ...current, photo: photoURL }));
      toast.success("Photo uploaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload your photo.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (uploadingPhoto) {
      toast.error("Wait for the photo upload to finish.");
      return;
    }
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    if (!signupRole) {
      toast.error("Choose whether you are joining as a customer or equipment owner.");
      return;
    }
    // Assignment rule: uppercase + lowercase + at least 6 characters
    const passwordProblem = validatePassword(form.password);
    if (passwordProblem) {
      toast.error(passwordProblem, { duration: 5000 });
      return;
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const created = await register({
        name: form.name.trim(),
        email: form.email.trim(),
        photoURL: form.photo.trim() || undefined,
        password: form.password,
        role: signupRole,
      });
      const next = searchParams.get("next");
      router.replace(next || dashboardPath[created.role] || "/dashboard/customer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const field =
    "ui-input ui-input-bordered flex w-full items-center gap-2 focus-within:outline-primary";

  return (
    <AuthShell
      mode="register"
      eyebrow="Get started"
      title={<>Create Account</>}
      subtitle="Let’s get you started."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <label className="ui-form-control">
          <div className="ui-label py-1">
            <span className="ui-label-text font-semibold">Full name</span>
          </div>
          <label className={field}>
            <UserRound className="size-4 opacity-60" />
            <input
              name="name"
              autoComplete="name"
              required
              placeholder="John Carter"
              value={form.name}
              onChange={update("name")}
              className="grow"
            />
          </label>
        </label>

        <label className="ui-form-control">
          <div className="ui-label py-1">
            <span className="ui-label-text font-semibold">Email address</span>
          </div>
          <label className={field}>
            <Mail className="size-4 opacity-60" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={update("email")}
              className="grow"
            />
          </label>
        </label>

        <div className="ui-form-control">
          <div className="ui-label py-1">
            <span className="ui-label-text font-semibold">
              Profile photo <span className="opacity-50">(optional)</span>
            </span>
          </div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <input
              ref={photoFileInput}
              type="file"
              accept="image/*"
              className="sr-only"
              aria-label="Choose a profile photo from this device"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto || submitting}
            />
            <button
              type="button"
              className="ui-button ui-button-outline ui-button-sm gap-2"
              onClick={() => photoFileInput.current?.click()}
              disabled={uploadingPhoto || submitting}
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
            <ImagePlus className="size-4 opacity-60" />
            <input
              name="photo"
              aria-label="Profile photo URL"
              placeholder="Or paste a photo URL"
              value={form.photo}
              onChange={update("photo")}
              className="grow"
            />
          </label>
        </div>

        <label className="ui-form-control">
          <div className="ui-label py-1">
            <span className="ui-label-text font-semibold">Password</span>
          </div>
          <label className={field}>
            <LockKeyhole className="size-4 opacity-60" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="new-password"
              required
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={update("password")}
              className="grow"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword((s) => !s)}
              className="ui-button ui-button-ghost ui-button-xs ui-button-circle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </label>
          <p className="mt-1 max-w-full text-xs leading-relaxed opacity-60">
            Must include an uppercase and a lowercase letter, min. 6 characters.
          </p>
        </label>

        <label className="ui-form-control">
          <div className="ui-label py-1">
            <span className="ui-label-text font-semibold">Confirm password</span>
          </div>
          <label className={field}>
            <LockKeyhole className="size-4 opacity-60" />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              autoComplete="new-password"
              required
              placeholder="Repeat your password"
              value={form.confirm}
              onChange={update("confirm")}
              className="grow"
            />
          </label>
        </label>

        <fieldset className="ui-form-control">
          <legend className="ui-label py-1">
            <span className="ui-label-text font-semibold">Choose your role</span>
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {([
              { value: "customer", title: "Customer", description: "Rent equipment" },
              { value: "owner", title: "Equipment owner", description: "List gear for rent" },
            ] as const).map((option) => (
              <label
                key={option.value}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  signupRole === option.value
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-base-content/15 hover:border-primary/50"
                }`}
              >
                <input
                  type="radio"
                  name="signupRole"
                  value={option.value}
                  checked={signupRole === option.value}
                  onChange={() => setSignupRole(option.value)}
                  className="ui-radio ui-radio-primary ui-radio-sm mt-0.5"
                />
                <span>
                  <span className="block text-sm font-semibold">{option.title}</span>
                  <span className="mt-1 block text-xs opacity-65">{option.description}</span>
                </span>
              </label>
            ))}
          </div>
          <span className="mt-1 text-xs opacity-60">Select a role to continue with email or Google.</span>
        </fieldset>

        <button type="submit" className="ui-button ui-button-primary mt-1 w-full font-bold" disabled={submitting}>
          {submitting ? <span className="ui-loading ui-loading-spinner ui-loading-sm" /> : "Sign Up"}
        </button>

        <div className="ui-divider my-1 text-xs opacity-60">OR SIGN UP WITH</div>

        <GoogleLoginButton text="signup_with" signupRole={signupRole ?? undefined} />

        <p className="mt-2 text-center text-sm opacity-75">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="ui-loading ui-loading-spinner ui-loading-lg text-primary" />
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
