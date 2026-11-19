import { BadgeCheck, CalendarCheck, LineChart, Search, ShieldCheck, Wallet } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

const features = [
  {
    icon: Search,
    title: "Server-side search & filters",
    body: "Keyword, location, category, rental type and price range are all resolved by the API — fast even with thousands of listings.",
  },
  {
    icon: ShieldCheck,
    title: "Protected routes & roles",
    body: "verifyToken, verifyRenter, verifyOwner and verifyAdmin guards keep every dashboard and endpoint behind the right role.",
  },
  {
    icon: Wallet,
    title: "Stripe escrow checkout",
    body: "Bookings are held for 35 minutes while you pay through Stripe Checkout, then confirmed server-side — never by the client.",
  },
  {
    icon: CalendarCheck,
    title: "Real availability engine",
    body: "Overlapping bookings are calculated per day, so the quantity you see is genuinely free for your exact dates.",
  },
  {
    icon: BadgeCheck,
    title: "Admin-approved listings",
    body: "Every new or edited item starts as pending and only reaches the public site after an admin approves it.",
  },
  {
    icon: LineChart,
    title: "Analytics that matter",
    body: "Live MongoDB aggregations power monthly revenue, bookings-per-month and role distribution charts for each role.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="section-pad bg-base-100">
      <div className="container-page">
        <SectionHeading
          eyebrow="Why choose us"
          title={
            <>
              Built for <span className="brand-text">trust</span> and speed
            </>
          }
          subtitle="A rental marketplace engineered around the hard parts: availability, payments and permissions."
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={Math.min(i * 0.08, 0.4)}>
              <article className="card-surface group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <span className="bg-secondary/15 text-secondary grid size-12 place-items-center rounded-xl transition-colors group-hover:bg-secondary group-hover:text-secondary-content">
                  <f.icon className="size-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-70">{f.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
