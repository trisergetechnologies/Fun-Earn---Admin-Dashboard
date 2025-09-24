"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { getToken, setToken, removeToken } from "@/helper/tokenHelper";
import { setupAxiosInterceptors } from "@/helper/setupAxios";

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

// ---------------- Context Types ----------------
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  login: (token: string) => Promise<void>;
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

  // Login → Save token + fetch user
  const login = async (token: string) => {
    setToken(token);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/user/getme`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUser(res.data.data);
    } catch (err) {
      console.error("Login fetch user failed:", err);
      removeToken();
      setUser(null);
    }
  };

  // Logout → remove token + redirect
  const logout = () => {
    removeToken();
    setUser(null);
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
