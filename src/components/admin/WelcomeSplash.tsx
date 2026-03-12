"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";

export const WELCOME_SPLASH_STORAGE_KEY = "admin_welcome_splash_shown";

const AUTO_DISMISS_SEC = 5;

type WelcomeSplashProps = {
  userName: string | null;
  onDismiss: () => void;
};

export default function WelcomeSplash({ userName, onDismiss }: WelcomeSplashProps) {
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_DISMISS_SEC);

  const displayName = userName?.trim() || "Mr. Basavaraja";

  useEffect(() => {
    setVisible(true);
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => setReady(true));
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    if (!visible || !ready) return;
    const interval = setInterval(() => setCountdown((c) => (c > 0 ? c - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, [visible, ready]);

  const handleDismiss = () => {
    if (typeof window !== "undefined") sessionStorage.setItem(WELCOME_SPLASH_STORAGE_KEY, "true");
    setReady(false);
    setTimeout(() => {
      setVisible(false);
      onDismiss();
    }, 1300);
  };

  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => {
      if (typeof window !== "undefined") sessionStorage.setItem(WELCOME_SPLASH_STORAGE_KEY, "true");
      setReady(false);
      setTimeout(() => {
        setVisible(false);
        onDismiss();
      }, 1300);
    }, AUTO_DISMISS_SEC * 1000);
    return () => clearTimeout(t);
  }, [visible, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center cursor-pointer"
      onClick={handleDismiss}
      role="dialog"
      aria-label="Welcome"
      style={{
        transition: "opacity 1.2s ease-out",
        opacity: ready ? 1 : 0,
      }}
    >
      {/* Full-screen soft gradient — very gentle, no harsh contrast */}
      <div
        className="absolute inset-0 dark:hidden"
        style={{
          background:
            "linear-gradient(165deg, #faf9f7 0%, #f5f3f0 35%, #f0eeea 70%, #ebe8e4 100%)",
          transition: "opacity 1.2s ease-out",
          opacity: ready ? 1 : 0,
        }}
      />
      <div
        className="absolute inset-0 hidden dark:block"
        style={{
          background:
            "linear-gradient(165deg, #1a1918 0%, #1f1e1c 35%, #252422 70%, #2a2927 100%)",
          transition: "opacity 1.2s ease-out",
          opacity: ready ? 1 : 0,
        }}
      />

      {/* Very subtle orbs — barely visible */}
      <div
        className="absolute top-[15%] left-[10%] w-[80vmax] h-[80vmax] rounded-full opacity-[0.04] dark:opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #d4a574 0%, transparent 70%)",
          filter: "blur(60px)",
          transition: "opacity 2s ease-out",
          opacity: ready ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-[20%] right-[15%] w-[60vmax] h-[60vmax] rounded-full opacity-[0.03] dark:opacity-[0.05]"
        style={{
          background: "radial-gradient(circle, #c9b8a8 0%, transparent 70%)",
          filter: "blur(50px)",
          transition: "opacity 2s ease-out 0.3s",
          opacity: ready ? 1 : 0,
        }}
      />

      {/* Content — full width, generous padding, no card */}
      <div
        className="relative w-full max-w-4xl px-8 sm:px-12 md:px-16 py-12 text-center"
        onClick={(e) => e.stopPropagation()}
        style={{
          transition: "opacity 1s ease-out 0.2s, transform 1s ease-out 0.2s",
          opacity: ready ? 1 : 0,
          transform: ready ? "scale(1)" : "scale(0.98)",
        }}
      >
        <p
          className="text-[15px] sm:text-base tracking-[0.2em] uppercase text-stone-500 dark:text-stone-400 mb-6 font-medium"
          style={{ letterSpacing: "0.25em" }}
        >
          It&apos;s good to see you again
        </p>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-stone-800 dark:text-stone-100 mb-6 leading-tight tracking-tight">
          Welcome back,
          <br />
          <span className="text-stone-700 dark:text-stone-200 font-light">
            {displayName}
          </span>
        </h1>

        <p className="text-xl sm:text-2xl md:text-3xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed font-light">
          We&apos;re glad you&apos;re here. Take your time.
        </p>

        <p
          className="mt-12 flex items-center justify-center gap-2 text-stone-400 dark:text-stone-500 text-base sm:text-lg"
          style={{ transition: "opacity 1s ease-out 0.8s", opacity: ready ? 1 : 0 }}
        >
          <Heart className="w-5 h-5 fill-current opacity-70" />
          <span className="font-light">With warmth</span>
          <Heart className="w-5 h-5 fill-current opacity-70" />
        </p>

        <p
          className="mt-8 text-sm text-stone-400 dark:text-stone-500 font-light"
          style={{ transition: "opacity 1s ease-out 1s", opacity: ready ? 1 : 0 }}
        >
          This message appears once per login
        </p>

        <p
          className="mt-6 text-stone-400 dark:text-stone-500 text-base font-light tabular-nums"
          style={{ transition: "opacity 1s ease-out 1.1s", opacity: ready ? 1 : 0 }}
        >
          Redirecting in <span className="text-stone-600 dark:text-stone-300 font-medium">{countdown}</span>
        </p>
      </div>
    </div>
  );
}
