"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import Reveal from "@/components/Reveal";

interface AuthShellProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
}

/** Two-column auth layout shared by the login and register pages. */
export default function AuthShell({ eyebrow, title, subtitle, children }: AuthShellProps) {
  return (
    <div className="container-page grid items-center gap-10 py-12 lg:grid-cols-2 lg:py-16">
      <Reveal className="order-2 lg:order-1">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 inline-block">
            <Logo />
          </Link>
          <span className="eyebrow">{eyebrow}</span>
          <h1 className="section-title mt-3">{title}</h1>
          <p className="section-subtitle mt-3">{subtitle}</p>
          <div className="card-surface mt-7 p-5 shadow-sm sm:p-7">{children}</div>
        </div>
      </Reveal>

      <Reveal delay={0.15} className="order-1 lg:order-2">
        <div className="relative aspect-4/3 w-full overflow-hidden rounded-3xl lg:aspect-3/4">
          {/* Custom SVG artwork — flat illustration of organised rental equipment */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url(/images/auth-side.svg)" }}
          />
          <div className="hero-overlay absolute inset-0" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-white sm:p-10">
            <p className="text-sm font-bold tracking-[0.2em] text-white/70 uppercase">
              Trusted marketplace
            </p>
            <p className="mt-3 text-2xl leading-snug font-extrabold sm:text-3xl">
              Rent verified equipment from local owners — pay securely with Stripe.
            </p>
            <div className="mt-5 flex flex-wrap gap-6 text-sm font-semibold text-white/85">
              <span>✓ 3-step booking</span>
              <span>✓ Escrowed payments</span>
              <span>✓ Owner analytics</span>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
