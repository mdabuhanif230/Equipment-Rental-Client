"use client";

import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import { Clock, Mail, MapPin, MessageCircleQuestion, Phone, Send } from "lucide-react";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/Reveal";

const CONTACTS = [
  { icon: Mail, label: "Email", value: "support@rentgear.com", href: "mailto:support@rentgear.com" },
  { icon: Phone, label: "Phone", value: "+880 1700-000000", href: "tel:+8801700000000" },
  { icon: MapPin, label: "Office", value: "Dhaka, Bangladesh", href: undefined },
  { icon: Clock, label: "Support hours", value: "Sat – Thu, 9:00 – 18:00", href: undefined },
];

const FAQS = [
  {
    q: "How does payment work?",
    a: "Creating a booking opens Stripe Checkout and holds the stock for 35 minutes. The server verifies the payment with Stripe — success and cancel pages never trust the browser.",
  },
  {
    q: "Can I cancel a booking?",
    a: "Yes. Any booking that is still pending and unpaid can be cancelled from your customer dashboard or from the payment-cancel page.",
  },
  {
    q: "Why is my equipment not public yet?",
    a: "New and edited listings start as pending. An admin must approve them before customers can see or book them.",
  },
  {
    q: "How do I become an owner?",
    a: "Choose Equipment owner when you sign up. If you already have a customer account, ask an administrator to switch your role to owner.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Name, email and message are required.");
      return;
    }
    // There is no mail API in this project, so we hand the message to the visitor's mail client
    const body = encodeURIComponent(`${form.message}\n\n— ${form.name} (${form.email})`);
    const subject = encodeURIComponent(form.subject || "RentGear enquiry");
    window.location.href = `mailto:support@rentgear.com?subject=${subject}&body=${body}`;
    toast.success("Opening your email client…");
  };

  return (
    <>
      <section className="section-pad bg-base-100">
        <div className="container-page">
          <SectionHeading
            level="h1"
            eyebrow="Contact us"
            title={
              <>
                Questions? <span className="brand-text">We answer.</span>
              </>
            }
            subtitle="Reach the team about listings, bookings, payments or anything about the platform."
          />

          <div className="mt-12 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="grid gap-3">
              {CONTACTS.map((c, i) => (
                <Reveal key={c.label} delay={i * 0.07}>
                  <div className="stat-surface flex items-center gap-4 p-4">
                    <span className="bg-primary/10 text-primary grid size-11 shrink-0 place-items-center rounded-xl">
                      <c.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs font-bold tracking-wide uppercase opacity-55">
                        {c.label}
                      </span>
                      {c.href ? (
                        <a href={c.href} className="block text-sm font-bold hover:text-primary">
                          {c.value}
                        </a>
                      ) : (
                        <span className="block text-sm font-bold">{c.value}</span>
                      )}
                    </span>
                  </div>
                </Reveal>
              ))}

              <Reveal delay={0.3}>
                <div className="rounded-3xl bg-cover bg-center p-6 text-white"
                  style={{ backgroundImage: "linear-gradient(rgba(4,33,29,.86), rgba(4,33,29,.86)), url(/images/hero.png)" }}
                >
                  <p className="flex items-center gap-2 text-sm font-bold">
                    <MessageCircleQuestion className="size-4 text-secondary" /> Prefer chat?
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/80">
                    Most questions are answered in the FAQ on the right — booking holds, listing
                    approvals and role changes are all covered there.
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.12}>
              <form onSubmit={handleSubmit} className="card-surface flex flex-col gap-4 p-6">
                <h2 className="text-xl font-extrabold">Send a message</h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="ui-form-control">
                    <span className="ui-label py-1 text-xs font-semibold opacity-70">Your name *</span>
                    <input
                      className="ui-input ui-input-bordered ui-input-sm"
                      value={form.name}
                      onChange={set("name")}
                      required
                      maxLength={80}
                    />
                  </label>
                  <label className="ui-form-control">
                    <span className="ui-label py-1 text-xs font-semibold opacity-70">Email *</span>
                    <input
                      type="email"
                      className="ui-input ui-input-bordered ui-input-sm"
                      value={form.email}
                      onChange={set("email")}
                      required
                    />
                  </label>
                </div>

                <label className="ui-form-control">
                  <span className="ui-label py-1 text-xs font-semibold opacity-70">Subject</span>
                  <input
                    className="ui-input ui-input-bordered ui-input-sm"
                    value={form.subject}
                    onChange={set("subject")}
                    maxLength={120}
                    placeholder="Booking #1234 payment question"
                  />
                </label>

                <label className="ui-form-control">
                  <span className="ui-label py-1 text-xs font-semibold opacity-70">Message *</span>
                  <textarea
                    className="ui-textarea ui-textarea-bordered w-full"
                    rows={5}
                    value={form.message}
                    onChange={set("message")}
                    required
                    maxLength={2000}
                    placeholder="Tell us how we can help…"
                  />
                </label>

                <button type="submit" className="ui-button ui-button-primary gap-2 self-start px-6 font-bold">
                  <Send className="size-4" /> Send message
                </button>
                <p className="text-xs opacity-55">
                  The message opens in your own mail client — nothing is stored by this demo.
                </p>
              </form>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section-pad bg-base-200">
        <div className="container-page max-w-3xl">
          <SectionHeading
            eyebrow="FAQ"
            title="Frequently asked questions"
            subtitle="The four things people ask most often."
          />

          <div className="mt-10 flex flex-col gap-3">
            {FAQS.map((item) => (
              <div key={item.q} className="ui-collapse ui-collapse-arrow bg-base-100 border-base-content/10 border">
                <input type="radio" name="faq" defaultChecked aria-label={item.q} />
                <div className="ui-collapse-title text-sm font-bold">{item.q}</div>
                <div className="ui-collapse-content text-sm opacity-75">
                  <p>{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
