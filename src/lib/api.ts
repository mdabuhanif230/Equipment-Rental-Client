import type { Paginated } from "./types";

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

export async function refreshAuthToken(): Promise<string> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/token`, {
      credentials: "include",
      cache: "no-store",
    });
  } catch {
    throw new ApiError("Could not connect to the service. Check your connection and try again.", 0);
  }

  const data = (await res.json().catch(() => null)) as { token?: string; message?: string } | null;
  if (!res.ok || !data?.token) {
    throw new ApiError(data?.message || "Your session has expired. Please sign in again.", res.status);
  }
  localStorage.setItem(TOKEN_KEY, data.token);
  return data.token;
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
  headers?: Record<string, string>;
}

async function request<T>(path: string, method: Method, options: RequestOptions = {}): Promise<T> {
  const token = options.auth === false ? null : getToken();
  const send = async (accessToken: string | null) => {
    const headers: Record<string, string> = {
      ...options.headers,
      "Content-Type": "application/json",
    };
    if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      cache: options.cache ?? "no-store",
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  };

  let res: Response;
  try {
    res = await send(token);
  } catch {
    throw new ApiError("Could not connect to the service. Check your connection and try again.", 0);
  }

  if (res.status === 401 && options.auth !== false && token) {
    try {
      const refreshedToken = await refreshAuthToken();
      if (refreshedToken !== token) {
        try {
          res = await send(refreshedToken);
        } catch {
          throw new ApiError("Could not connect to the service. Check your connection and try again.", 0);
        }
      }
    } catch (error) {
      if (!(error instanceof ApiError) || error.status === 0) throw error;
    }
  }

  let data: unknown = null;
  const text = await res.text();
  const isHtml = res.headers.get("content-type")?.includes("text/html") ?? false;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const responseMessage =
      data && typeof data === "object" && "message" in data &&
      typeof data.message === "string"
        ? data.message
        : "";
    const message = isHtml || !responseMessage
      ? res.status === 404
        ? "This service is unavailable right now. Please try again later."
        : "We couldn't complete your request. Please try again."
      : responseMessage;
    if (res.status === 401 && options.auth !== false && typeof window !== "undefined") clearSession();
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

export type { Paginated };
