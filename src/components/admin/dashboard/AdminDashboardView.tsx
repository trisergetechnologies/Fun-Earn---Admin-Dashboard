"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import {
  Box as BoxIcon,
  UserCircle as UserCircleIcon,
  Clock as TimeIcon,
  Wallet as WalletIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Settings as SettingsIcon,
  Package,
  IndianRupeeIcon,
  Calendar,
  TrendingUp,
} from "lucide-react";
import ComponentCard from "@/components/common/ComponentCard";
import { getToken } from "@/helper/tokenHelper";
import DashboardStatCard from "./DashboardStatCard";
import DashboardOrdersChart, { DailyPoint } from "./DashboardOrdersChart";
import OrderReportExport from "./OrderReportExport";

interface DashboardData {
  today: { orderCount: number; paidRevenue: number };
  thisMonth: { orderCount: number; paidRevenue: number };
  dailySeriesLast30: DailyPoint[];
}

const shortcuts = [
  { icon: <BoxIcon className="h-5 w-5" />, name: "Products", path: "/admin/product" },
  { icon: <UserCircleIcon className="h-5 w-5" />, name: "Users", path: "/admin/users" },
  { icon: <TimeIcon className="h-5 w-5" />, name: "Watch Hours", path: "/admin/watch-hours" },
  { icon: <WalletIcon className="h-5 w-5" />, name: "System Wallet", path: "/admin/system-wallet" },
  { icon: <ShoppingBasketIcon className="h-5 w-5" />, name: "Orders", path: "/admin/orders" },
  { icon: <IndianRupeeIcon className="h-5 w-5" />, name: "Payouts", path: "/admin/payments" },
  { icon: <Package className="h-5 w-5" />, name: "Packages", path: "/admin/package" },
  { icon: <SettingsIcon className="h-5 w-5" />, name: "Settings", path: "/admin/settings" },
];

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export default function AdminDashboardView() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/order/dashboard`;
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && res.data.data) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || "Could not load dashboard");
      }
    } catch {
      setError("Could not load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="text-red-600 dark:text-red-400">{error}</p>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 md:gap-6">
            <DashboardStatCard
              icon={<Calendar className="h-6 w-6" />}
              label="Today's orders"
              value={String(data.today.orderCount)}
            />
            <DashboardStatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Today's revenue"
              value={inr.format(data.today.paidRevenue)}
            />
            <DashboardStatCard
              icon={<Calendar className="h-6 w-6" />}
              label="This month's orders"
              value={String(data.thisMonth.orderCount)}
            />
            <DashboardStatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="This month's revenue"
              value={inr.format(data.thisMonth.paidRevenue)}
            />
          </div>

          <ComponentCard
            title="Last 30 days"
            desc="Two simple charts: order count per day, then money collected per day."
          >
            <DashboardOrdersChart series={data.dailySeriesLast30} />
          </ComponentCard>
        </>
      ) : null}

      <ComponentCard title="Download report" desc="Excel file with paid orders for the period you choose.">
        <OrderReportExport />
      </ComponentCard>

      <ComponentCard title="Shortcuts">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {shortcuts.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-800 transition hover:border-indigo-300 hover:shadow dark:border-gray-800 dark:bg-white/[0.03] dark:text-white dark:hover:border-indigo-600"
            >
              <span className="text-indigo-600 dark:text-indigo-400">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </div>
      </ComponentCard>
    </div>
  );
}
