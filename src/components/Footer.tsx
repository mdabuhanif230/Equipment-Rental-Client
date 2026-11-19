import Link from "next/link";
import { AtSign, Globe, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Logo from "@/components/Logo";

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
    <footer className="border-base-content/10 border-t bg-base-200">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed opacity-70">
            The equipment rental platform where customers rent reliable gear and owners earn from
            the tools they already own — powered by secure Stripe payments.
          </p>
          <div className="mt-5 space-y-2 text-sm opacity-80">
            <p className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" /> Dhaka, Bangladesh
            </p>
            <p className="flex items-center gap-2">
              <Mail className="size-4 text-primary" /> support@rentgear.com
            </p>
            <p className="flex items-center gap-2">
              <Phone className="size-4 text-primary" /> +880 1700-000000
            </p>
          </div>
          <div className="mt-5 flex gap-3">
            {[Globe, AtSign, MessageCircle, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="social link"
                className="btn btn-circle btn-ghost btn-sm border border-base-content/10"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-bold tracking-wide uppercase opacity-60">{col.title}</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="opacity-75 transition hover:text-primary hover:opacity-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-base-content/10 border-t">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs opacity-70 sm:flex-row">
          <p>© {new Date().getFullYear()} RentGear — Equipment Rental Platform. All rights reserved.</p>
          <p>Built with Next.js, Express &amp; Stripe</p>
        </div>
      </div>
    </footer>
  );
}
