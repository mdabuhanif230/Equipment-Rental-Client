"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import AuthShell from "@/components/AuthShell";
import GoogleLoginButton from "@/components/GoogleLoginButton";
import { useAuth } from "@/context/AuthContext";
import type { Role } from "@/lib/types";

const dashboardPath: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

function LoginInner() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const next = searchParams.get("next");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      toast.error("Please enter your email and password.");
      return;
    }
    setSubmitting(true);
    try {
      const loggedIn = await login(email.trim(), password);
      router.replace(next || dashboardPath[loggedIn.role]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title={<>Sign in to your account</>}
      subtitle="Access your bookings, favorites and dashboard — your session survives page reloads."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Email address</span>
          </div>
          <label className="input input-bordered flex items-center gap-2 focus-within:outline-primary">
            <Mail className="size-4 opacity-60" />
            <input
              type="email"
              name="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="grow"
            />
          </label>
        </label>

        <label className="form-control">
          <div className="label py-1">
            <span className="label-text font-semibold">Password</span>
          </div>
          <label className="input input-bordered flex items-center gap-2 focus-within:outline-primary">
            <LockKeyhole className="size-4 opacity-60" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
        </label>

        <button type="submit" className="btn btn-primary mt-2 w-full font-bold" disabled={submitting}>
          {submitting ? <span className="loading loading-spinner loading-sm" /> : "Sign In"}
        </button>

        <div className="divider my-1 text-xs opacity-60">OR CONTINUE WITH</div>

        <GoogleLoginButton />

        <p className="mt-2 text-center text-sm opacity-75">
          New to RentGear?{" "}
          <Link href="/register" className="font-bold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-[70vh] place-items-center">
          <span className="loading loading-spinner loading-lg text-primary" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
