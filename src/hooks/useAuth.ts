import { useState, useCallback } from "react";
import { User } from "../types";
import { api, setToken, getToken } from "@/lib/api";
import type { LoginResponse } from "@/lib/api-types";

const AUTH_KEY = "prolead_auth";

export type UserRole = "Admin" | "Supervisor" | "Agent";

export interface AuthUser extends User {
  role: UserRole;
  isOnline: boolean;
  avatarInitials: string;
}

export const ROLE_HOME: Record<UserRole, string> = {
  Admin: "/dashboard",
  Supervisor: "/dashboard",
  Agent: "/workspace",
};

export const ROLE_ROUTES: Record<UserRole, string[]> = {
  Admin: ["*"],
  Supervisor: ["/dashboard", "/leads", "/campaigns", "/agents", "/analytics", "/notifications"],
  Agent: ["/workspace", "/leads", "/tasks", "/notifications"],
};

export function canAccess(role: UserRole, path: string): boolean {
  const allowed = ROLE_ROUTES[role];
  if (allowed.includes("*")) return true;
  return allowed.some((r) => path === r || path.startsWith(r + "/"));
}

function persistUser(user: AuthUser | null) {
  if (user) localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  else localStorage.removeItem(AUTH_KEY);
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const applySession = useCallback((data: LoginResponse) => {
    setToken(data.token);
    persistUser(data.user);
    setUser(data.user);
    return data.user;
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/login", { email, password });
      const u = applySession(data);
      return { success: true, user: u };
    } catch (e) {
      return {
        success: false,
        error: e instanceof Error ? e.message : "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const loginQuick = async (role: UserRole): Promise<AuthUser> => {
    setLoading(true);
    try {
      const data = await api.post<LoginResponse>("/auth/quick-login", { role });
      return applySession(data);
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (getToken()) await api.post("/auth/logout");
    } catch {
      /* ignore */
    }
    setToken(null);
    persistUser(null);
    setUser(null);
  }, []);

  const refreshMe = useCallback(async () => {
    if (!getToken()) return;
    try {
      const me = await api.get<AuthUser>("/auth/me");
      persistUser(me);
      setUser(me);
    } catch {
      setToken(null);
      persistUser(null);
      setUser(null);
    }
  }, []);

  const isAuthenticated = !!user && !!getToken();

  return { user, login, loginQuick, logout, refreshMe, isAuthenticated, loading };
}
