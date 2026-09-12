"use client";

import React, { useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import BasicTableOne from "./BasicTableOne";
import { Users, CheckCircle2, Sparkles } from "lucide-react";

export default function UsersView() {
  const [stats, setStats] = useState<{
    totalUsers: number | null;
    totalActiveUsers: number | null;
  }>({
    totalUsers: null,
    totalActiveUsers: null,
  });

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Users" />

      {/* Heading Stat Cards: Total Users & Total Active Users */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {/* Total Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-xs transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Users
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {stats.totalUsers !== null
                    ? stats.totalUsers.toLocaleString("en-IN")
                    : "—"}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  registered accounts
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Total members onboarded across the platform
              </p>
            </div>
          </div>
        </div>

        {/* Total Active Users (having any package or serial number) */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/40 p-5 shadow-xs transition-shadow hover:shadow-md dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                  Total Active Users
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200">
                  <Sparkles className="h-3 w-3" />
                  Package / Serial #
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <h3 className="text-2xl font-extrabold text-emerald-700 dark:text-emerald-300">
                  {stats.totalActiveUsers !== null
                    ? stats.totalActiveUsers.toLocaleString("en-IN")
                    : "—"}
                </h3>
                <span className="text-xs text-emerald-700/80 dark:text-emerald-300/80">
                  active members
                </span>
              </div>
              <p className="mt-1 text-xs text-emerald-700/90 dark:text-emerald-400/90">
                Users having any package or active serial number
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Directory Table Card */}
      <ComponentCard
        title={
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                All Users Directory
              </h3>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Search, filter, view team trees, and inspect user wallet details
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-300">
                <Users className="h-3.5 w-3.5 text-blue-500" />
                Total:{" "}
                <strong className="font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers !== null
                    ? stats.totalUsers.toLocaleString("en-IN")
                    : "..."}
                </strong>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                Active (Package/SN):{" "}
                <strong className="font-bold text-emerald-700 dark:text-emerald-300">
                  {stats.totalActiveUsers !== null
                    ? stats.totalActiveUsers.toLocaleString("en-IN")
                    : "..."}
                </strong>
              </span>
            </div>
          </div>
        }
      >
        <BasicTableOne onStatsLoaded={setStats} />
      </ComponentCard>
    </div>
  );
}
