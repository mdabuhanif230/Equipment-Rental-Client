import type { AuthResponse, Paginated } from "./types";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:5000/api";

const TOKEN_KEY = "er_token";
const USER_KEY = "er_user";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/* ---------------- token / user persistence ---------------- */

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser<T>(): T | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function storeSession(token: string, user: unknown): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function updateUserCache(user: unknown): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* ---------------- core request ---------------- */

type Method = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

interface RequestOptions {
  body?: unknown;
  auth?: boolean;
  cache?: RequestCache;
}

async function request<T>(path: string, method: Method, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const token = getToken();
  if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    cache: options.cache ?? "no-store",
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  let data: unknown = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = { message: text };
    }
  }

  if (!res.ok) {
    const message =
      (data as { message?: string } | null)?.message || `Request failed (${res.status})`;
    if (res.status === 401 && typeof window !== "undefined") clearSession();
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export const api = {
  get: <T,>(path: string, options?: RequestOptions) => request<T>(path, "GET", options),
  post: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "POST", { ...options, body }),
  patch: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PATCH", { ...options, body }),
  put: <T,>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, "PUT", { ...options, body }),
  delete: <T,>(path: string, options?: RequestOptions) => request<T>(path, "DELETE", options),
};

export type { AuthResponse, Paginated };
