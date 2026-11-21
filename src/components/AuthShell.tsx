"use client";

import Link from "next/link";
import Image from "next/image";
import { CircleCheck } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";

type AuthMode = "login" | "register";

interface AuthShellProps {
  mode: AuthMode;
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}

/** Shared split-card layout for sign-in and account creation. */
export default function AuthShell({ mode, eyebrow, title, subtitle, children }: AuthShellProps) {
  const isLogin = mode === "login";

  return (
      <div className={`relative isolate overflow-hidden bg-[#f3f7f8] py-8 sm:py-12 ${isLogin ? "lg:py-10" : "lg:py-16"}`}>
      <div aria-hidden className="pointer-events-none absolute -right-28 -top-28 size-96 rounded-full bg-emerald-100/70 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 size-96 rounded-full bg-sky-100/60 blur-3xl" />

      <div className="container-page relative">
        <div className={`mx-auto grid overflow-hidden rounded-[1.6rem] border border-slate-200/80 bg-white shadow-[0_28px_80px_-42px_rgba(15,45,55,0.42)] ${isLogin ? "max-w-5xl lg:grid-cols-[1.05fr_.95fr]" : "max-w-6xl lg:grid-cols-[0.95fr_1.05fr]"}`}>
          <aside className={`relative isolate flex flex-col overflow-hidden ${isLogin ? "aspect-[0.99] bg-white lg:aspect-auto lg:min-h-[540px]" : "min-h-[560px] bg-[#f0faf5] p-7 text-slate-950 sm:p-10 lg:min-h-[700px] lg:p-11"}`}>
            {isLogin ? (
              <Image src="/images/auth-login-reference.png" alt="RentGear equipment rental welcome panel with tools" fill priority sizes="(min-width: 1024px) 52vw, 100vw" className="object-cover" />
            ) : (
              <>
                <div aria-hidden className="absolute -right-16 -top-16 -z-10 size-64 rounded-full bg-emerald-100" />
                <div aria-hidden className="absolute -bottom-28 -left-14 -z-10 size-72 rounded-full bg-emerald-200/80" />
                <div aria-hidden className="absolute right-4 top-3 h-16 w-12 opacity-70" style={{ backgroundImage: "radial-gradient(#65c99d 1.5px, transparent 1.5px)", backgroundSize: "10px 10px" }} />
                <Image src="/images/auth-gear-illustration.png" alt="Hard hat, laptop, and camera from the RentGear reference" width={280} height={113} sizes="(min-width: 1024px) 45vw, 100vw" className="pointer-events-none absolute inset-x-0 top-auto bottom-0 h-[38%] w-full object-contain object-bottom" />
                <Link href="/" aria-label="RentGear home" className="relative z-10 w-fit">
                  <Logo className="text-slate-900" />
                </Link>
                <div className="relative z-10 mt-5 max-w-[25rem]">
                  <h2 className="mt-3 text-4xl leading-[1.04] font-black tracking-[-0.045em] text-slate-950 sm:text-[2.75rem]">
                    Start Your<br />Rental Journey
                  </h2>
                  <p className="mt-4 max-w-sm text-sm leading-6 text-slate-700 sm:text-[0.95rem]">
                    Create your account and unlock access to thousands of equipment listings.
                  </p>
                  <ul className="relative z-10 mt-5 grid gap-2.5 text-sm font-medium text-slate-800">
                    {["Easy Booking", "Secure Payment", "24/7 Support"].map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CircleCheck className="size-[1.1rem] shrink-0 fill-green-500 text-white" strokeWidth={2.5} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </aside>

          <section className={`relative z-10 flex items-center ${isLogin ? "px-6 py-7 sm:px-8 lg:px-9 lg:py-8" : "px-5 py-9 sm:px-10 sm:py-11 lg:px-12 lg:py-12"}`}>
            <div className={`mx-auto w-full ${isLogin ? "max-w-[24rem]" : "max-w-[27rem]"}`}>
              <div className="mb-6">
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-[1.75rem]">{title}</h1>
                <p className="mt-1.5 text-sm leading-6 text-slate-500">{subtitle}</p>
              </div>

              <div className="auth-form text-slate-800">
                {children}
              </div>

            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
