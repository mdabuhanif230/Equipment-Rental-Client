"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, CalendarDays, Search, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EASE: [number, number, number, number] = [0.22, 0.61, 0.36, 1];

const container = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: EASE },
  }),
};

const highlights = [
  { icon: ShieldCheck, label: "Secure checkout" },
  { icon: BadgeCheck, label: "Approved listings" },
  { icon: Wallet, label: "Flexible rental periods" },
];

export default function Hero() {
  const router = useRouter();
  const [term, setTerm] = useState("");

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    router.push(term.trim() ? `/all-equipment?search=${encodeURIComponent(term.trim())}` : "/all-equipment");
  };

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div aria-hidden className="pointer-events-none absolute -top-32 right-0 size-[34rem] rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 size-[32rem] rounded-full bg-secondary/10 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute right-[4%] top-24 hidden h-[34rem] w-[34rem] rounded-full border border-primary/10 lg:block" />

      <div className="container-page relative grid items-center gap-12 py-14 sm:py-20 lg:min-h-[720px] lg:grid-cols-[1.05fr_.95fr] lg:gap-10 lg:py-24">
        <div className="relative z-10 max-w-2xl">
          <motion.span
            custom={0}
            variants={container}
            initial="hidden"
            animate="show"
            className="eyebrow rounded-full border border-primary/15 bg-primary/5 px-4 py-2 tracking-[0.12em]"
          >
            RentGear marketplace
          </motion.span>

          <motion.h1
            custom={1}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-6 text-4xl leading-[1.06] font-black tracking-tight sm:text-5xl lg:text-6xl"
          >
            Get the gear.
            <br />
            <span className="brand-text">Get the job done.</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Find reliable equipment from local owners, book the time you need, and keep your next
            project moving.
          </motion.p>

          <motion.form
            custom={3}
            variants={container}
            initial="hidden"
            animate="show"
            onSubmit={handleSearch}
            className="mt-8 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-lg shadow-primary/5 sm:flex-row"
          >
            <label className="flex min-w-0 flex-1 items-center gap-2 pl-3">
              <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <Input
                type="search"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="What are you looking to rent?"
                aria-label="Search equipment"
                className="h-11 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            </label>
            <Button type="submit" className="h-11 px-6">
              Search <ArrowRight className="size-4" aria-hidden />
            </Button>
          </motion.form>

          <motion.div
            custom={4}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground"
          >
            <span className="font-medium text-foreground">Popular:</span>
            {["Power Tools", "Construction Equipment", "Photography Equipment"].map((category) => (
              <Link
                key={category}
                href={`/all-equipment?category=${encodeURIComponent(category)}`}
                className="transition-colors hover:text-primary"
              >
                {category}
              </Link>
            ))}
          </motion.div>

          <motion.div
            custom={5}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-5"
          >
            {highlights.map(({ icon: Icon, label }) => (
              <span key={label} className="inline-flex items-center gap-2 text-sm font-medium">
                <Icon className="size-4 text-primary" aria-hidden />
                {label}
              </span>
            ))}
          </motion.div>

          <motion.div
            custom={6}
            variants={container}
            initial="hidden"
            animate="show"
            className="mt-8 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/all-equipment">Explore equipment <ArrowRight className="size-4" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">List your equipment</Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.25, ease: EASE }}
          className="relative mx-auto w-full max-w-2xl lg:translate-x-3"
        >
          <div className="absolute -inset-3 rotate-3 rounded-[2.5rem] border border-primary/15 bg-primary/[0.035]" aria-hidden />
          <div className="relative aspect-[1.08] overflow-hidden rounded-[2rem] border border-white/15 bg-[#062c25] shadow-2xl shadow-primary/20 sm:aspect-[1.2] lg:aspect-[0.98]">
            <Image
              src="/images/hero-equipment-light.png"
              alt="Yellow excavator ready for a construction project"
              fill
              priority
              sizes="(min-width: 1024px) 46vw, 100vw"
              className="object-cover transition-transform duration-700 hover:scale-[1.035]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#041a17]/95 via-[#062c25]/5 to-[#062c25]/10" />
            <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#082c25]/75 px-3.5 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur-md sm:left-7 sm:top-7">
              <span className="size-2 rounded-full bg-[#79d5a8] shadow-[0_0_12px_#79d5a8]" />
              EQUIPMENT THAT SHOWS UP
            </div>
            <div className="absolute inset-x-5 bottom-5 rounded-[1.5rem] border border-white/15 bg-[#09251f]/80 p-5 text-white shadow-xl backdrop-blur-xl sm:inset-x-7 sm:bottom-7 sm:p-6">
              <div className="flex items-center gap-2 text-xs font-bold tracking-[0.16em] text-[#a6d8c2] uppercase">
                <Sparkles className="size-3.5" /> Rent. Use. Return.
              </div>
              <p className="mt-2 max-w-md text-xl leading-tight font-bold sm:text-2xl">
                The right equipment, right when you need it.
              </p>
              <div className="mt-5 flex items-center justify-between border-t border-white/15 pt-4 text-xs text-white/75">
                <span className="inline-flex items-center gap-2"><CalendarDays className="size-4 text-[#83d0ae]" /> Book by the day or week</span>
                <span className="font-semibold text-white">Local owners · Real gear</span>
              </div>
            </div>
          </div>
          <div className="absolute -left-3 top-[18%] hidden items-center gap-3 rounded-2xl border border-border/70 bg-card/95 p-4 shadow-xl shadow-foreground/10 backdrop-blur sm:flex lg:-left-10">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="block text-sm font-bold">Book with confidence</span>
              <span className="block text-xs text-muted-foreground">Secure online payments</span>
            </span>
          </div>
          <div className="absolute -right-2 top-[48%] hidden rounded-2xl border border-border/70 bg-card p-3.5 shadow-xl shadow-foreground/10 sm:block lg:-right-7">
            <p className="text-[10px] font-bold tracking-[0.15em] text-muted-foreground uppercase">Your next project</p>
            <p className="mt-1 text-sm font-bold"><span className="text-primary">Starts here.</span> Gear nearby.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
