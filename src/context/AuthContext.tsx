"use client";

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  AuthTokensInput,
  getMeUrl,
  getRefreshToken,
  getToken,
  getUserRole,
  removeToken,
  saveAuthTokens,
  setUserRole,
} from "@/helper/tokenHelper";
import { ensureFreshAccessToken, setupAxiosInterceptors } from "@/helper/setupAxios";
import { WELCOME_SPLASH_STORAGE_KEY } from "@/components/admin/WelcomeSplash";

// ---------------- Types ----------------
export interface ShortVideoProfile {
  watchTime: number;
  videoUploads: string[];
}

export interface ECartProfile {
  addresses: any[];
  orders: string[];
  bankDetails: any;
}

export interface Wallets {
  shortVideoWallet: number;
  eCartWallet: number;
  rewardWallet: string[];
}

export interface Package {
  _id: string;
  name: string;
  color?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  gender: string;
  role: string;
  applications: string[];
  state_address: string;
  referralCode: string;
  referredBy?: string;
  serialNumber?: number;
  package?: Package;
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  image?: string;
  shortVideoProfile: ShortVideoProfile;
  eCartProfile: ECartProfile;
  wallets: Wallets;
}

// User shape returned from /auth/login
export interface LoginResponseUser {
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  gender?: string;
  role?: string;
  applications?: string[];
  phone?: string;
  referralCode?: string;
}

export type LoginTokens =
  | string
  | (AuthTokensInput & {
      /** @deprecated Prefer accessToken + refreshToken */
      token?: string | null;
    });

// ---------------- Context Types ----------------
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (tokens: LoginTokens, userFromLogin?: LoginResponseUser | null) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function resolveAccessToken(tokens: LoginTokens): string {
  if (typeof tokens === "string") return tokens;
  return (tokens.accessToken || tokens.token || "") as string;
}

// ---------------- Provider ----------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();
  const logoutRef = useRef(() => {});

  const logout = () => {
    removeToken();
    setUser(null);
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem(WELCOME_SPLASH_STORAGE_KEY);
      } catch (_) {}
    }
    router.push("/signin");
  };

  logoutRef.current = logout;

  // Interceptors first, then restore session (so 401 can silent-refresh)
  useEffect(() => {
    setupAxiosInterceptors(() => logoutRef.current());

    const initAuth = async () => {
      let token = getToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      const meUrl = getMeUrl(getUserRole());

      try {
        const res = await axios.get(meUrl);
        setUser(res.data.data);
        if (res.data.data?.role) setUserRole(res.data.data.role);
      } catch (err) {
        // Interceptor may already have refreshed+retried. If still failing and we have
        // a refresh token, try once more explicitly (covers race before interceptors).
        if (getRefreshToken()) {
          const fresh = await ensureFreshAccessToken();
          if (fresh) {
            try {
              const res = await axios.get(meUrl, {
                headers: { Authorization: `Bearer ${fresh}` },
              });
              setUser(res.data.data);
              if (res.data.data?.role) setUserRole(res.data.data.role);
              setIsAuthLoading(false);
              return;
            } catch {
              // fall through to clear
            }
          }
        }
        console.error("Auth check failed:", err);
        removeToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  const mapLoginUser = (u: LoginResponseUser | null | undefined): User | null => {
    if (!u) return null;
    return {
      _id: (u._id ?? u.id ?? "") as string,
      name: u.name ?? "",
      email: u.email ?? "",
      phone: u.phone,
      gender: u.gender ?? "",
      role: u.role ?? "admin",
      applications: u.applications ?? [],
      state_address: "",
      referralCode: u.referralCode ?? "",
      createdAt: "",
      updatedAt: "",
      shortVideoProfile: { watchTime: 0, videoUploads: [] },
      eCartProfile: { addresses: [], orders: [], bankDetails: null },
      wallets: { shortVideoWallet: 0, eCartWallet: 0, rewardWallet: [] },
    };
  };

  const login = async (tokens: LoginTokens, userFromLogin?: LoginResponseUser | null) => {
    if (typeof tokens === "string") {
      saveAuthTokens({ accessToken: tokens });
    } else {
      saveAuthTokens(tokens);
    }

    const access = resolveAccessToken(tokens);
    if (userFromLogin?.role) setUserRole(userFromLogin.role);
    const initialUser = mapLoginUser(userFromLogin);
    if (initialUser) setUser(initialUser);

    if (!access) return;

    try {
      const res = await axios.get(getMeUrl(userFromLogin?.role), {
        headers: { Authorization: `Bearer ${access}` },
      });
      if (res.data?.data) {
        setUser(res.data.data);
        if (res.data.data.role) setUserRole(res.data.data.role);
      }
    } catch (err) {
      console.error("Login fetch user failed:", err);
      if (!initialUser) {
        removeToken();
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
