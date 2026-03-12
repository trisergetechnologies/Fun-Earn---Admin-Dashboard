"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getToken, setToken, removeToken } from "@/helper/tokenHelper";
import { setupAxiosInterceptors } from "@/helper/setupAxios";
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

// ---------------- Context Types ----------------
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string, userFromLogin?: LoginResponseUser | null) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ---------------- Provider ----------------
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const router = useRouter();

  // Load user if token exists
  useEffect(() => {
    const initAuth = async () => {
      const token = getToken();
      if (!token) {
        setIsAuthLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/user/getme`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(res.data.data);
      } catch (err) {
        console.error("Auth check failed:", err);
        removeToken();
        setUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    initAuth();
  }, []);

  // Map login response user to full User shape (so name shows immediately)
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

  // Login → Save token, set user from login response immediately, then optionally fetch full profile
  const login = async (token: string, userFromLogin?: LoginResponseUser | null) => {
    setToken(token);
    const initialUser = mapLoginUser(userFromLogin);
    if (initialUser) setUser(initialUser);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/user/getme`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.data) setUser(res.data.data);
    } catch (err) {
      console.error("Login fetch user failed:", err);
      if (!initialUser) {
        removeToken();
        setUser(null);
      }
    }
  };

  // Logout → remove token, clear welcome splash flag (so next login shows splash once), redirect
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

  useEffect(() => {
    setupAxiosInterceptors(logout);
  }, []);

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

// ---------------- Hook ----------------
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
