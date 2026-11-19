import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RentGear — Equipment Rental Platform",
    template: "%s | RentGear",
  },
  description:
    "RentGear is a modern equipment rental platform: customers rent verified tools and machines, owners earn from their gear, and admins manage the whole marketplace.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Applies the persisted light/dark theme before first paint to avoid a flash */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('er_theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'geardark':'gear';}document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','gear');}",
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              {/* Navbar reads the current URL (usePathname), which streams in after prerendering */}
              <Suspense
                fallback={
                  <div className="bg-base-100/70 h-16 border-b border-transparent backdrop-blur-sm md:h-[72px]" />
                }
              >
                <Navbar />
              </Suspense>
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3500,
                style: {
                  fontSize: "0.9rem",
                  borderRadius: "0.75rem",
                  fontWeight: 600,
                },
                success: { iconTheme: { primary: "#0d7a6f", secondary: "#ffffff" } },
                error: { iconTheme: { primary: "#dc2626", secondary: "#ffffff" } },
              }}
            />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
