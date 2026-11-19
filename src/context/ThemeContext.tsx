"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "gear" | "geardark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const THEME_KEY = "er_theme";

function systemTheme(): Theme {
  if (typeof window === "undefined") return "gear";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "geardark" : "gear";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("gear");

  // Hydrate from localStorage (or system preference) without a flash of wrong theme.
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const initial = saved ?? systemTheme();
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "gear" ? "geardark" : "gear";
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.setAttribute("data-theme", next);
      return next;
    });
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
