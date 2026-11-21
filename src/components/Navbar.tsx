"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LayoutDashboard, LogOut, Menu, Moon, Sun, UserRound, X } from "lucide-react";
import toast from "react-hot-toast";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import type { Role } from "@/lib/types";

const dashboardPath: Record<Role, string> = {
  customer: "/dashboard/customer",
  owner: "/dashboard/owner",
  admin: "/dashboard/admin",
};

const links = [
  { href: "/", label: "Home" },
  { href: "/all-equipment", label: "All Equipment" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    const frame = requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Close menus whenever the route changes (state adjusted during render, per React docs)
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setMobileOpen(false);
    setMenuOpen(false);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not log out.");
    }
    router.push("/");
  };

  const navLink = (href: string, label: string) => (
    <Link
      key={href}
      href={href}
      className={`px-3 py-2 text-sm font-semibold transition-colors ${
        isActive(href)
          ? "text-primary"
          : "opacity-75 hover:text-primary hover:opacity-100"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? "border-base-content/10 bg-base-100/90 shadow-sm backdrop-blur-md"
          : "border-transparent bg-base-100/70 backdrop-blur-sm"
      }`}
    >
      <nav className="container-page flex h-16 items-center justify-between gap-4 md:h-[72px]">
        <Link href="/" aria-label="RentGear home">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => navLink(l.href, l.label))}
          {user && navLink(dashboardPath[user.role], "Dashboard")}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={toggleTheme}
            variant="ghost"
            size="icon"
            className="rounded-full"
            aria-label={theme === "gear" ? "Switch to dark mode" : "Switch to light mode"}
          >
            {theme === "gear" ? <Moon className="size-4.5" /> : <Sun className="size-4.5" />}
          </Button>

          {loading ? (
            <span className="ui-loading ui-loading-spinner ui-loading-sm text-primary" />
          ) : user ? (
            <div className="ui-dropdown ui-dropdown-end relative" ref={menuRef}>
              <Button
                type="button"
                tabIndex={0}
                onClick={() => setMenuOpen((o) => !o)}
                variant="ghost"
                size="sm"
                className="gap-2 px-2"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={menuOpen}
              >
                <span className="ui-avatar size-8">
                  <span className="ring-primary ring-offset-base-100 grid w-full place-items-center rounded-full ring-2 ring-offset-1 text-xs font-bold uppercase text-primary">
                    {user.photoURL ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.photoURL} alt={user.name} className="rounded-full" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </span>
                </span>
                <span className="hidden max-w-28 truncate text-sm font-semibold sm:block">
                  {user.name}
                </span>
              </Button>
              {menuOpen && (
                <ul
                  tabIndex={0}
                  role="menu"
                  className="ui-dropdown-content ui-menu bg-base-100 rounded-box z-50 mt-2 w-56 border border-base-content/10 p-2 shadow-xl"
                >
                  <li className="ui-menu-title px-3 py-2">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="ui-badge ui-badge-ghost ui-badge-sm capitalize">{user.role}</span>
                  </li>
                  <li>
                    <Link href="/profile" role="menuitem">
                      <UserRound className="size-4" /> My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href={dashboardPath[user.role]} role="menuitem">
                      <LayoutDashboard className="size-4" /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <button type="button" role="menuitem" onClick={handleLogout}>
                      <LogOut className="size-4" /> Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full lg:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="border-base-content/10 border-t bg-base-100 px-4 pb-4 pt-2 lg:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => navLink(l.href, l.label))}
            {user && navLink(dashboardPath[user.role], "Dashboard")}
            {user ? (
              <>
                {navLink("/profile", "My Profile")}
                <Button
                  type="button"
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="mt-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
