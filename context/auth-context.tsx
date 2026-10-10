"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { auth, authService, type ProfileDTO, type AuthDTO } from "@/lib/api";

interface AuthContextValue {
  user: ProfileDTO | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: AuthDTO) => Promise<void>;
  loginWithGoogle: (token: string) => Promise<void>;
  logout: () => void;
  setUser: (user: ProfileDTO) => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUserState] = React.useState<ProfileDTO | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Restore session on mount
  React.useEffect(() => {
    const token = auth.getToken();
    const savedUser = auth.getUser();
    if (token && savedUser) {
      setUserState(savedUser);
    }
    setIsLoading(false);
  }, []);

  // Listen for 401 events from the API layer
  React.useEffect(() => {
    const handler = () => {
      setUserState(null);
      router.replace("/login");
    };
    window.addEventListener("mm:unauthorized", handler);
    return () => window.removeEventListener("mm:unauthorized", handler);
  }, [router]);

  const login = React.useCallback(
    async (credentials: AuthDTO) => {
      const { user: responseUser } = await authService.login(credentials);
      // If backend doesn't embed profile in login response, build a minimal one
      const profile: ProfileDTO = responseUser ?? {
        email: credentials.email,
        fullName: credentials.email.split("@")[0],
      };
      auth.setUser(profile);
      setUserState(profile);
      router.replace("/dashboard");
    },
    [router]
  );

  const loginWithGoogle = React.useCallback(
    async (googleToken: string) => {
      const { user: responseUser } = await authService.loginWithGoogle(googleToken);
      const profile: ProfileDTO = responseUser ?? {
        email: "",
        fullName: "Google user",
      };
      auth.setUser(profile);
      setUserState(profile);
      router.replace("/dashboard");
    },
    [router]
  );

  const logout = React.useCallback(() => {
    authService.logout();
    setUserState(null);
    router.replace("/login");
  }, [router]);

  const setUser = React.useCallback((u: ProfileDTO) => {
    auth.setUser(u);
    setUserState(u);
  }, []);

  const value: AuthContextValue = React.useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      loginWithGoogle,
      logout,
      setUser,
    }),
    [user, isLoading, login, loginWithGoogle, logout, setUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
