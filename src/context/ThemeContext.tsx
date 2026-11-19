"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export type Theme = "gear" | "geardark";

const THEME_KEY = "er_theme";
const listeners = new Set<() => void>();

function readTheme(): Theme {
  if (typeof document === "undefined") return "gear";
  return document.documentElement.getAttribute("data-theme") === "geardark" ? "geardark" : "gear";
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function toggleTheme(): void {
  const next: Theme = readTheme() === "gear" ? "geardark" : "gear";
  document.documentElement.setAttribute("data-theme", next);
  try {
    localStorage.setItem(THEME_KEY, next);
  } catch {
    /* storage may be unavailable */
  }
  listeners.forEach((listener) => listener());
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * The active theme lives on <html data-theme>, seeded by an inline script in the root
 * layout before first paint, so the store simply mirrors that attribute. This keeps the
 * light/dark toggle instant and persists it in localStorage.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "gear" as Theme);

  const value: ThemeContextValue = { theme, toggleTheme };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>");
  return ctx;
}
