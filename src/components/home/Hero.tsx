"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Search, ShieldCheck, Wallet, Wrench } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const container = {
  hidden: { opacity: 0, y: 30 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: EASE },
  }),
};

const highlights = [
  { icon: Wrench, label: "1,200+ listed items" },
  { icon: ShieldCheck, label: "Verified owners" },
  { icon: Wallet, label: "Secure Stripe payments" },
];

export default function Hero() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(term.trim() ? `/all-equipment?search=${encodeURIComponent(term.trim())}` : "/all-equipment");
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Custom SVG artwork (kept as a background layer so it paints before hydration) */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/images/hero.svg)" }}
      />
      <div className="hero-overlay absolute inset-0" />
      <div
        className="absolute inset-0 opacity-25 mix-blend-screen"
        style={{ background: "radial-gradient(60% 60% at 78% 30%, rgba(18,165,148,.55), transparent 70%)" }}
      />

      <div className="container-page relative z-10 flex min-h-[600px] flex-col justify-center py-20 lg:min-h-[700px] lg:py-28">
        <div className="max-w-3xl text-white">
          <motion.span
            custom={0}
            variants={container}
            initial="hidden"
            animate="show"
            className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-bold tracking-[0.16em] uppercase backdrop-blur"
          >
            <span className="bg-secondary size-1.5 rounded-full" /> Equipment Rental Marketplace
          </motion.span>

          <motion.h1
            custom={1}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 text-4xl leading-[1.08] font-black tracking-tight sm:text-5xl lg:text-6xl"
          >
            Rent the gear you need.{" "}
            <span className="text-secondary">Earn from the gear you don&apos;t.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
          >
            From power tools to heavy machinery — search thousands of verified listings, book in
            minutes and pay securely with Stripe. Owners earn; projects move forward.
          </motion.p>

          <motion.form
            custom={3}
            variants={container}
            initial="hidden"
            animate="show"
            onSubmit={handleSearch}
            className="mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl bg-white/95 p-2 shadow-2xl sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-2 px-3">
              <Search className="size-4 text-base-content/50" />
              <input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="What do you need? e.g. excavator, drill…"
                aria-label="Search equipment"
                className="input input-ghost w-full min-h-11 px-0 font-medium focus:outline-none"
              />
            </label>
            <button type="submit" className="btn btn-primary px-6 font-bold">
              Search <ArrowRight className="size-4" />
            </button>
          </motion.form>

          <motion.div
            custom={4}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-7 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm font-semibold text-white/85"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2">
                <Icon className="size-4 text-secondary" /> {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            custom={5}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-9 flex flex-wrap gap-3"
          >
            <a href="/all-equipment" className="btn btn-secondary px-7 font-bold text-secondary-content">
              Browse Equipment
            </a>
            <a
              href="/register"
              className="btn btn-outline border-white/40 px-7 font-bold text-white hover:border-white hover:bg-white hover:text-base-100"
            >
              List Your Equipment
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
