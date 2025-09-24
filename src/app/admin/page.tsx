"use client";

import React from "react";
import Link from "next/link";
import {
  Grid as GridIcon,
  Box as BoxIcon,
  UserCircle as UserCircleIcon,
  Clock as TimeIcon,
  Wallet as WalletIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Settings as SettingsIcon,
} from "lucide-react";

const menu = [
  { icon: <GridIcon className="w-6 h-6" />, name: "Dashboard", path: "/admin" },
  { icon: <BoxIcon className="w-6 h-6" />, name: "Products", path: "/admin/product" },
  { icon: <UserCircleIcon className="w-6 h-6" />, name: "Users", path: "/admin/users" },
  { icon: <TimeIcon className="w-6 h-6" />, name: "Watch Hours", path: "/admin/watch-hours" },
  { icon: <WalletIcon className="w-6 h-6" />, name: "System Wallet & Logs", path: "/admin/system-wallet" },
  { icon: <ShoppingBasketIcon className="w-6 h-6" />, name: "Orders", path: "/admin/orders" },
  { icon: <SettingsIcon className="w-6 h-6" />, name: "Settings", path: "/admin/settings" },
];

export default function AdminWelcome() {
  return (
    <div className="relative min-h-screen p-8 flex flex-col items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-black" />
      <div className="absolute inset-0 bg-grid-slate-200/40 dark:bg-grid-slate-700/20 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

      <div className="relative w-full max-w-6xl space-y-12 text-center">
        {/* Welcome Message */}
        <div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white drop-shadow-sm">
            Welcome to the Admin Panel
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Manage your platform with ease — explore products, monitor users,
            review orders, track system wallets, and configure settings.  
            Everything you need is just a click away.
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {menu.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="group p-6 rounded-2xl shadow-lg bg-white/70 dark:bg-gray-900/70 
              backdrop-blur-sm border border-gray-200 dark:border-gray-800 flex flex-col items-center 
              justify-center hover:-translate-y-1 hover:shadow-xl transition"
            >
              <div className="p-4 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition">
                {item.icon}
              </div>
              <h3 className="mt-4 font-semibold text-gray-800 dark:text-white">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 opacity-90">
                Go to {item.name}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}








// import type { Metadata } from "next";
// import { EcommerceMetrics } from "@/components/ecommerce/EcommerceMetrics";
// import React from "react";
// import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
// import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
// import StatisticsChart from "@/components/ecommerce/StatisticsChart";
// import RecentOrders from "@/components/ecommerce/RecentOrders";
// import DemographicCard from "@/components/ecommerce/DemographicCard";

// export const metadata: Metadata = {
//   title:
//     "Next.js E-commerce Dashboard | TailAdmin - Next.js Dashboard Template",
//   description: "This is Next.js Home for TailAdmin Dashboard Template",
// };

// export default function Ecommerce() {
//   return (
//     <div className="grid grid-cols-12 gap-4 md:gap-6">
//       <div className="col-span-12 space-y-6 xl:col-span-7">
//         <EcommerceMetrics />

//         <MonthlySalesChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <MonthlyTarget />
//       </div>

//       <div className="col-span-12">
//         <StatisticsChart />
//       </div>

//       <div className="col-span-12 xl:col-span-5">
//         <DemographicCard />
//       </div>

//       <div className="col-span-12 xl:col-span-7">
//         <RecentOrders />
//       </div>
//     </div>
//   );
// }
