"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { initSpotifyClient } from "@spotify-taste/spotify-client";
import { tokenStore } from "@/lib/token-store";

interface AuthContextValue {
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initSpotifyClient({
      getAccessToken: () => tokenStore.getValidAccessToken(),
      onAuthFailure: () => {
        tokenStore.clear();
        window.location.href = "/login";
      },
    });

    async function checkAuth() {
      try {
        await tokenStore.getValidAccessToken();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    checkAuth();
  }, []);

  const logout = useCallback(async () => {
    tokenStore.clear();
    await fetch("/api/auth/refresh", { method: "DELETE" });
    setIsAuthenticated(false);
    window.location.href = "/login";
  }, []);

  const getAccessToken = useCallback(async () => {
    const token = await tokenStore.getValidAccessToken();
    setIsAuthenticated(true);
    return token;
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, logout, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
