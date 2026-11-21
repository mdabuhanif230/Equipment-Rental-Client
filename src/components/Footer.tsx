import Link from "next/link";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import Logo from "@/components/Logo";

// Evaluated once at module load so the footer stays prerender-safe
const YEAR = new Date().getFullYear();

const columns = [
  {
    title: "Platform",
    links: [
      { href: "/all-equipment", label: "Browse Equipment" },
      { href: "/register", label: "Become an Owner" },
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "For Customers",
    links: [
      { href: "/all-equipment", label: "Search & Filter" },
      { href: "/login", label: "My Bookings" },
      { href: "/profile", label: "My Profile" },
      { href: "/dashboard/customer", label: "Customer Dashboard" },
    ],
  },
  {
    title: "For Owners & Admins",
    links: [
      { href: "/dashboard/owner", label: "Owner Dashboard" },
      { href: "/dashboard/admin", label: "Admin Dashboard" },
      { href: "/register", label: "List Equipment" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container-page grid gap-12 py-14 md:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-16">
        <div>
          <Logo className="text-primary-foreground" />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-primary-foreground/75">
            A better way to find the equipment your project needs — and put the tools you own to
            work.
          </p>
          <div className="mt-6 space-y-3 text-sm text-primary-foreground/80">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0" /> Dhaka, Bangladesh
            </p>
            <a className="flex w-fit items-center gap-2 transition hover:text-white" href="mailto:support@rentgear.com">
              <Mail className="size-4 shrink-0" /> support@rentgear.com
            </a>
            <a className="flex w-fit items-center gap-2 transition hover:text-white" href="tel:+8801700000000">
              <Phone className="size-4 shrink-0" /> +880 1700-000000
            </a>
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold tracking-wide text-primary-foreground/60 uppercase">{col.title}</h3>
            <ul className="mt-4 space-y-3 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="group inline-flex items-center gap-1 text-primary-foreground/80 transition hover:text-white">
                    {l.label} <ArrowUpRight className="size-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-primary-foreground/65 sm:flex-row">
          <p>© {YEAR} RentGear — Equipment Rental Platform. All rights reserved.</p>
          <p>Built with Next.js, Express &amp; Stripe</p>
        </div>
      </div>
    </footer>
  );
}
