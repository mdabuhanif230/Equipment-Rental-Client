"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import toast from "react-hot-toast";
import {
  api,
  clearSession,
  getStoredUser,
  getToken,
  storeSession,
  updateUserCache,
  type AuthResponse,
} from "@/lib/api";
import type { Role, User } from "@/lib/types";

interface RegisterInput {
  name: string;
  email: string;
  photoURL?: string;
  password: string;
}

type ProfileUpdate = Partial<Pick<User, "name" | "photoURL" | "phone" | "address">>;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string) => Promise<User>;
  logout: () => void;
  updateProfile: (input: ProfileUpdate) => Promise<User>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** Password rules from the assignment: at least one uppercase, one lowercase, 6+ chars. */
export function validatePassword(password: string): string | null {
  if (password.length < 6) return "Password must be at least 6 characters long.";
  if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter.";
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate the session on reload so private routes never bounce a logged-in user to /login.
  useEffect(() => {
    const token = getToken();
    const cached = getStoredUser<User>();
    if (token && cached) {
      api
        .get<{ user: User }>("/auth/me")
        .then(({ user: fresh }) => {
          setUser(fresh);
          updateUserCache(fresh);
        })
        .catch(() => {
          // network hiccup: fall back to the cached session instead of logging out
          setUser(cached);
        })
        .finally(() => setLoading(false));
    } else {
      clearSession();
      Promise.resolve().then(() => setLoading(false));
    }
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const problem = validatePassword(input.password);
    if (problem) {
      toast.error(problem);
      throw new Error(problem);
    }
    const res = await api.post<AuthResponse>("/auth/register", input);
    storeSession(res.token, res.user);
    setUser(res.user);
    toast.success(`Welcome to RentGear, ${res.user.name}!`);
    return res.user;
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    storeSession(res.token, res.user);
    setUser(res.user);
    toast.success(`Welcome back, ${res.user.name}!`);
    return res.user;
  }, []);

  // Google users always get the customer role (decided by the server)
  const loginWithGoogle = useCallback(async (idToken: string): Promise<User> => {
    const res = await api.post<AuthResponse>("/auth/google", { idToken });
    storeSession(res.token, res.user);
    setUser(res.user);
    toast.success(`Welcome, ${res.user.name}!`);
    return res.user;
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    toast.success("You have been logged out.");
  }, []);

  const updateProfile = useCallback(async (input: ProfileUpdate): Promise<User> => {
    const { user: fresh } = await api.patch<{ user: User }>("/users/me", input);
    setUser(fresh);
    updateUserCache(fresh);
    return fresh;
  }, []);

  const hasRole = useCallback(
    (...roles: Role[]) => (user ? roles.includes(user.role) : false),
    [user],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, register, login, loginWithGoogle, logout, updateProfile, hasRole }),
    [user, loading, register, login, loginWithGoogle, logout, updateProfile, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
