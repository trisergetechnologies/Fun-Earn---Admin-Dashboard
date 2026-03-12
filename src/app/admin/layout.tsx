"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import WelcomeSplash, { WELCOME_SPLASH_STORAGE_KEY } from "@/components/admin/WelcomeSplash";
import React, { useEffect, useCallback, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const { isAuthLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [splashGate, setSplashGate] = useState<"pending" | "show" | "done">("pending");
  const onSplashDismiss = useCallback(() => setSplashGate("done"), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const alreadyShown = sessionStorage.getItem(WELCOME_SPLASH_STORAGE_KEY);
    setSplashGate(alreadyShown ? "done" : "show");
  }, []);

  // Handle redirect if not authenticated
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/signin");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  // Sidebar margin logic
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  // Show loading spinner while auth is being checked
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Don’t render layout until auth state is confirmed
  if (!isAuthenticated) {
    return null;
  }

  const splashBgLight = "linear-gradient(165deg, #faf9f7 0%, #f5f3f0 35%, #f0eeea 70%, #ebe8e4 100%)";
  const splashBgDark = "linear-gradient(165deg, #1a1918 0%, #1f1e1c 35%, #252422 70%, #2a2927 100%)";

  if (splashGate === "pending" || splashGate === "show") {
    return (
      <>
        <div className="fixed inset-0 z-[99998] dark:hidden" style={{ background: splashBgLight }} aria-hidden />
        <div className="fixed inset-0 z-[99998] hidden dark:block" style={{ background: splashBgDark }} aria-hidden />
        {splashGate === "show" && (
          <WelcomeSplash userName={user?.name?.trim() || "Mr. Basavaraja"} onDismiss={onSplashDismiss} />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
