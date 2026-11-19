import { CreditCard, KeyRound, PackageCheck, Search, type LucideIcon } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

const steps: { icon: LucideIcon; title: string; body: string }[] = [
  {
    icon: Search,
    title: "Search & compare",
    body: "Filter by keyword, city, category, rental type and budget. Sorting by price or newest happens on the server.",
  },
  {
    icon: CreditCard,
    title: "Book & pay securely",
    body: "Pick your dates, quantity and delivery details, then complete payment through Stripe Checkout in one redirect.",
  },
  {
    icon: PackageCheck,
    title: "Receive & return",
    body: "The owner hands over the gear, you use it for the agreed period, and the booking is marked completed.",
  },
  {
    icon: KeyRound,
    title: "Owners get paid",
    body: "Listings that are approved appear publicly; completed rentals flow straight into the owner's earnings chart.",
  },
];

export default function HowItWorks() {
  return (
    <section className="section-pad relative overflow-hidden bg-base-200">
      <div className="container-page">
        <SectionHeading
          eyebrow="How it works"
          title="From search to keys in four steps"
          subtitle="A single flow for renters, owners and admins — no hidden states, no guesswork."
        />

        <ol className="relative mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <span className="bg-primary/25 absolute top-10 right-10 left-10 hidden h-0.5 lg:block" />
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={Math.min(i * 0.1, 0.4)}>
              <li className="card-surface relative h-full p-6">
                <span className="bg-primary text-primary-content relative z-10 grid size-12 place-items-center rounded-2xl text-lg font-black">
                  {i + 1}
                </span>
                <span className="text-primary mt-5 block">
                  <step.icon className="size-6" />
                </span>
                <h3 className="mt-3 text-base font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-70">{step.body}</p>
              </li>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
