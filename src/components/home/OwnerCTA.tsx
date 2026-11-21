import Link from "next/link";
import { ArrowRight, Banknote, ChartNoAxesColumnIncreasing, Timer } from "lucide-react";
import Reveal from "@/components/Reveal";
import { Button } from "@/components/ui/button";

const bullets = [
  { icon: Banknote, title: "Zero listing fee", body: "Publish unlimited equipment and only share a cut after a completed rental." },
  { icon: ChartNoAxesColumnIncreasing, title: "Live earnings chart", body: "Monthly revenue is aggregated straight from payments and rendered for you." },
  { icon: Timer, title: "35-minute holds", body: "Stock is reserved the moment a booking starts, so you never get double-booked." },
];

/** Extra home section: recruitment band for equipment owners. */
export default function OwnerCTA() {
  return (
    <section className="section-pad bg-base-100">
      <div className="container-page">
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-3xl">
            <div
              aria-hidden
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url(/images/owners.png)" }}
            />
            <div className="hero-overlay absolute inset-0" />

            <div className="relative z-10 grid gap-8 p-7 sm:p-10 lg:grid-cols-2 lg:p-14">
              <div className="text-white">
                <span className="eyebrow text-secondary">For equipment owners</span>
                <h2 className="mt-4 text-3xl leading-tight font-black sm:text-4xl">
                  Your tools shouldn&apos;t sit in the dark.
                </h2>
                <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/80 sm:text-base">
                  List the gear you already own, let our admins verify it once, and start earning
                  from every completed rental — with payments settled through Stripe.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <Button asChild variant="secondary" size="lg">
                    <Link href="/register">Become an owner</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-white/40 bg-transparent text-white hover:border-white hover:bg-white hover:text-foreground"
                  >
                    <Link href="/all-equipment">See what rents out</Link>
                  </Button>
                </div>
              </div>

              <div className="grid content-center gap-3">
                {bullets.map((b) => (
                  <div
                    key={b.title}
                    className="flex items-start gap-4 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <span className="bg-secondary text-secondary-content grid size-10 shrink-0 place-items-center rounded-xl">
                      <b.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-bold text-white">{b.title}</span>
                      <span className="block text-xs leading-relaxed text-white/75">{b.body}</span>
                    </span>
                  </div>
                ))}
                <Link
                  href="/dashboard/owner"
                  className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-secondary hover:underline"
                >
                  Preview the owner dashboard <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
