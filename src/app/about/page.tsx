import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  Gauge,
  Handshake,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why RentGear exists: a trusted equipment rental marketplace connecting owners with the gear idle in their sheds to customers who need it for a day, a week or a month.",
};

const values = [
  {
    icon: ShieldCheck,
    title: "Trust first",
    body: "Every listing is approved by an admin, every payment is verified by Stripe on the server, and every role is checked on each request.",
  },
  {
    icon: Gauge,
    title: "Built for speed",
    body: "Search, filters, sorting and pagination are executed by the API, so the catalogue stays fast as it grows.",
  },
  {
    icon: Handshake,
    title: "Fair for owners",
    body: "Owners keep what they earn from gear that would otherwise sit idle, with transparent earnings analytics.",
  },
  {
    icon: Sparkles,
    title: "Honest reviews",
    body: "Only customers who completed a rental can review it — one review per booking, always tied to a real handover.",
  },
];

const stack = [
  { label: "Frontend", items: "Next.js App Router · TypeScript · Tailwind CSS · DaisyUI · Framer Motion · Recharts" },
  { label: "Backend", items: "Express · MongoDB Atlas · JSON Web Tokens · bcrypt" },
  { label: "Payments", items: "Stripe Checkout with server-side verification and webhook fallback" },
  { label: "Auth", items: "Email/password plus Google social login (customers only)" },
];

export default function AboutPage() {
  return (
    <>
      {/* intro */}
      <section className="section-pad bg-base-100">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            align="left"
            eyebrow="About RentGear"
            title={
              <>
                Idle equipment is a <span className="brand-text">wasted opportunity</span>
              </>
            }
            subtitle="RentGear connects people who own tools and machines with people who need them — for a day, a week or a month. Owners earn, renters save, and nothing gathers dust."
          >
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/all-equipment" className="btn btn-primary px-6 font-bold">
                Browse equipment <ArrowRight className="size-4" />
              </Link>
              <Link href="/register" className="btn btn-outline px-6 font-bold">
                Become an owner
              </Link>
            </div>
          </SectionHeading>

          <Reveal delay={0.15}>
            <div className="relative aspect-4/3 overflow-hidden rounded-3xl">
              <div
                aria-hidden
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url(/images/owners.svg)" }}
              />
              <div className="hero-overlay absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-3xl font-black">One handover at a time</p>
                <p className="mt-1 text-sm text-white/80">
                  Real listings, real owners, real payments.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* values */}
      <section className="section-pad bg-base-200">
        <div className="container-page">
          <SectionHeading
            eyebrow="What we stand for"
            title="Four principles behind every screen"
            subtitle="The same rules guide the code: verify on the server, show the truth, keep it fast."
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.08}>
                <article className="card-surface h-full p-6">
                  <span className="bg-primary/10 text-primary grid size-12 place-items-center rounded-xl">
                    <v.icon className="size-6" />
                  </span>
                  <h2 className="mt-4 text-lg font-bold">{v.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed opacity-70">{v.body}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* tech */}
      <section className="section-pad bg-base-100">
        <div className="container-page">
          <SectionHeading
            eyebrow="Under the hood"
            title="A full-stack project, not a template"
            subtitle="Every layer of the assignment is implemented end-to-end."
          />
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {stack.map((row, i) => (
              <Reveal key={row.label} delay={i * 0.07}>
                <div className="stat-surface h-full p-5">
                  <p className="eyebrow">
                    <Compass className="size-3.5" /> {row.label}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed font-semibold">{row.items}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal delay={0.2}>
            <div className="mt-10 text-center">
              <Link href="/contact" className="btn btn-primary px-7 font-bold">
                Get in touch
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
