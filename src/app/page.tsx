"use client";

import Link from "next/link";
import { Grid, PlayCircle, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/3 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse delay-200" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl text-center px-6">
        <h1 className="text-5xl md:text-6xl font-extrabold drop-shadow-lg">
          Welcome to Admin Dashboard ✨
        </h1>
        <p className="mt-6 text-lg md:text-xl text-white/90">
          Manage <span className="font-semibold">Fun & Enjoy</span> and{" "}
          <span className="font-semibold">Dream Mart</span> from one place.  
        </p>

        {/* Two App Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Fun & Enjoy */}
          <Link
            href="/admin"
            className="group p-8 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl hover:bg-white/20 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <PlayCircle className="w-14 h-14 text-yellow-300 group-hover:scale-110 transition-transform" />
              <h3 className="mt-4 text-2xl font-bold">Fun & Enjoy</h3>
              <p className="mt-2 text-sm text-white/80">
                Manage users, watch hours, referrals, and rewards for the Short Video app.
              </p>
            </div>
          </Link>

          {/* Dream Mart */}
          <Link
            href="/admin"
            className="group p-8 rounded-2xl bg-white/10 backdrop-blur-xl shadow-xl hover:bg-white/20 transition transform hover:scale-105"
          >
            <div className="flex flex-col items-center text-center">
              <ShoppingBag className="w-14 h-14 text-green-300 group-hover:scale-110 transition-transform" />
              <h3 className="mt-4 text-2xl font-bold">Dream Mart</h3>
              <p className="mt-2 text-sm text-white/80">
                Manage products, orders, coupons, and system wallet for the E-Commerce app.
              </p>
            </div>
          </Link>
        </div>
        <div className="mt-10">
          <Link
            href="/admin"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-white text-indigo-600 font-semibold text-lg shadow-xl hover:scale-105 hover:shadow-2xl transition transform"
          >
            <Grid className="w-6 h-6" />
            Go to Dashboard
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-sm text-white/70">
        Use the sidebar inside each app to explore more features.
      </div>
    </div>
  );
}
