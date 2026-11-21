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
import { authClient } from "@/lib/auth-client";
import {
  ApiError,
  api,
  clearSession,
  getStoredUser,
  refreshAuthToken,
  storeSession,
  updateUserCache,
} from "@/lib/api";
import type { Role, User } from "@/lib/types";

interface RegisterInput {
  name: string;
  email: string;
  photoURL?: string;
  password: string;
  role: Exclude<Role, "admin">;
}

type ProfileUpdate = Partial<Pick<User, "name" | "photoURL" | "phone" | "address">>;

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
  loginWithGoogle: (idToken: string, signupRole?: Exclude<Role, "admin">) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<User>;
  hasRole: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getGoogleProfilePhoto(idToken: string): string | null {
  const payload = idToken.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const claims: unknown = JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
    if (
      typeof claims === "object" &&
      claims !== null &&
      "picture" in claims &&
      typeof claims.picture === "string" &&
      /^https:\/\//i.test(claims.picture)
    ) {
      return claims.picture;
    }
  } catch {
    return null;
  }
  return null;
}

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
    let active = true;
    const cached = getStoredUser<User>();
    const restore = async () => {
      try {
        const session = await authClient.getSession();
        if (session.error) {
          throw new ApiError(session.error.message || "Could not restore your session.", session.error.status);
        }
        if (!session.data?.user) {
          clearSession();
          return;
        }
        const token = await refreshAuthToken();
        storeSession(token, session.data.user);
        const { user: fresh } = await api.get<{ user: User }>("/users/me");
        if (active) {
          setUser(fresh);
          updateUserCache(fresh);
        }
      } catch (error) {
        if (error instanceof ApiError && error.status === 0 && cached) {
          if (active) setUser(cached);
        } else {
          clearSession();
          if (active) setUser(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void restore();
    return () => {
      active = false;
    };
  }, []);

  const loadAuthenticatedUser = useCallback(async (message: string): Promise<User> => {
    const token = await refreshAuthToken();
    const { user: fresh } = await api.get<{ user: User }>("/users/me");
    storeSession(token, fresh);
    setUser(fresh);
    toast.success(message.replace("{name}", fresh.name));
    return fresh;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<User> => {
    const problem = validatePassword(input.password);
    if (problem) {
      toast.error(problem);
      throw new Error(problem);
    }
    const result = await authClient.signUp.email({
      name: input.name,
      email: input.email,
      password: input.password,
      image: input.photoURL,
      role: input.role,
    });
    if (result.error) throw new Error(result.error.message || "Could not create your account.");
    return loadAuthenticatedUser("Welcome to RentGear, {name}!");
  }, [loadAuthenticatedUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const result = await authClient.signIn.email({ email, password });
    if (result.error) throw new Error(result.error.message || "Email or password is incorrect.");
    return loadAuthenticatedUser("Welcome, {name}!");
  }, [loadAuthenticatedUser]);

  const loginWithGoogle = useCallback(async (
    idToken: string,
    signupRole?: Exclude<Role, "admin">,
  ): Promise<User> => {
    await api.post<{ token: string; user: User }>(
      "/auth/one-tap/callback",
      { idToken, callbackURL: `${window.location.origin}/dashboard` },
      {
        auth: false,
        headers: signupRole ? { "X-Signup-Role": signupRole } : undefined,
      },
    );
    let authenticatedUser = await loadAuthenticatedUser("Welcome back, {name}!");
    if (!authenticatedUser.photoURL) {
      const photoURL = getGoogleProfilePhoto(idToken);
      if (photoURL) {
        try {
          const result = await api.patch<{ user: User }>("/users/me", { photoURL });
          authenticatedUser = result.user;
          setUser(authenticatedUser);
          updateUserCache(authenticatedUser);
        } catch (error) {
          toast.error(
            error instanceof Error
              ? `Signed in, but couldn't save your Google photo: ${error.message}`
              : "Signed in, but couldn't save your Google photo.",
          );
        }
      }
    }
    return authenticatedUser;
  }, [loadAuthenticatedUser]);

  const logout = useCallback(async () => {
    const result = await authClient.signOut();
    if (result.error) throw new Error(result.error.message || "Could not end the session.");
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
