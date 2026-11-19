"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, ImagePlus, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth, validatePassword } from "@/context/AuthContext";
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
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const update = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Name and email are required.");
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
        photo: form.photo.trim() || undefined,
        password: form.password,
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
    "input input-bordered flex w-full items-center gap-2 focus-within:outline-primary";

  return (
    <AuthShell
      eyebrow="Join RentGear"
      title={<>Create your account</>}
      subtitle="Register as a customer, rent in seconds, or switch to owner mode to earn from your gear."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Full name</span>
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

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Email address</span>
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

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">
              Photo URL <span className="opacity-50">(optional)</span>
            </span>
          </div>
          <label className={field}>
            <ImagePlus className="size-4 opacity-60" />
            <input
              name="photo"
              placeholder="https://i.ibb.co/your-avatar.png"
              value={form.photo}
              onChange={update("photo")}
              className="grow"
            />
          </label>
        </label>

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Password</span>
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
              className="btn btn-ghost btn-xs btn-circle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </label>
          <div className="label py-1">
            <span className="label-text-alt opacity-60">
              Must include an uppercase and a lowercase letter, min. 6 characters.
            </span>
          </div>
        </label>

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Confirm password</span>
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

        <button type="submit" className="btn btn-primary mt-1 w-full font-bold" disabled={submitting}>
          {submitting ? <span className="loading loading-spinner loading-sm" /> : "Create Account"}
        </button>

        <div className="divider my-1 text-xs opacity-60">OR SIGN UP WITH</div>

        <GoogleLoginButton text="signup_with" />

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
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <RegisterInner />
    </Suspense>
  );
}
