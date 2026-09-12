"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  PieChart,
} from "lucide-react";

type Distribution = {
  samePoolPercent?: number;
  walletPercent?: number;
  nextPoolPercent?: number;
  adminPercent?: number;
  featurePercent?: number;
};

type PoolConfigRow = {
  _id?: string;
  poolLevel: number;
  entryAmount: number;
  collectionMultiplier: number;
  maxCycles: number;
  distribution?: Distribution;
  active: boolean;
  configVersion?: number;
};

function formatNum(num?: number | null): string {
  if (num == null || isNaN(num)) return "0";
  return num.toLocaleString("en-IN");
}

export default function AutopoolConfigs() {
  const [rows, setRows] = useState<PoolConfigRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConfigs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await autopoolAdmin("/configs");
      setRows(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message || "Failed to load pool configs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-2xl">
            Pool Configurations & Economics
          </h1>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            10-Tier multi-pool matrix structure, distribution splits, and cycle payout rules.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchConfigs}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-50 dark:border-gray-800 dark:bg-white/[0.04] dark:text-gray-200 dark:hover:bg-white/[0.08]"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
          <Link
            href="/admin/autopool/matrix"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-brand-600"
          >
            <span>Live Matrix Tree</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* 4 Macro Stat Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Layers className="h-4 w-4 text-brand-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Tiers</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-gray-900 dark:text-white">
            10 Pools
          </p>
          <p className="text-[11px] text-gray-400">Pool 1 through Pool 10</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Matrix Model</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-gray-900 dark:text-white">
            2× Binary
          </p>
          <p className="text-[11px] text-gray-400">2 members trigger cycle</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Cycle Cap</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-gray-900 dark:text-white">
            10 Cycles / Tier
          </p>
          <p className="text-[11px] text-gray-400">Full graduation limit</p>
        </div>

        <div className="rounded-xl border border-gray-200/80 bg-white p-3.5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <PieChart className="h-4 w-4 text-purple-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Default Split</span>
          </div>
          <p className="mt-1.5 text-lg font-extrabold text-gray-900 dark:text-white">
            50 / 20 / 20 / 10
          </p>
          <p className="text-[11px] text-gray-400">Re-entry · Profit · Reserve · Admin</p>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 px-4 py-3.5 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-900 dark:text-white">
                Tier Economics Breakdown
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Calculated distribution amounts for each completed cycle across all 10 tiers.
              </p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              {rows.length} Pools Configured
            </span>
          </div>
        </div>

        {error && (
          <div className="border-b border-red-100 bg-red-50/50 p-4 text-xs font-medium text-red-600 dark:border-red-900/30 dark:bg-red-950/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading && rows.length === 0 ? (
          <div className="space-y-3 p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500 dark:text-gray-400">
            No pool configurations found. Restart backend to initialize defaults.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-left text-xs dark:divide-gray-800">
              <thead className="bg-gray-50/80 uppercase tracking-wider text-gray-500 dark:bg-white/[0.02] dark:text-gray-400">
                <tr>
                  <th className="py-3 pl-4 pr-3 font-semibold">Tier</th>
                  <th className="px-3 py-3 text-right font-semibold">Entry Cost</th>
                  <th className="px-3 py-3 text-right font-semibold">Intake (2×)</th>
                  <th className="px-3 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                    User Profit (20%)
                  </th>
                  <th className="px-3 py-3 text-right font-semibold">Auto Re-entry (50%)</th>
                  <th className="px-3 py-3 text-right font-semibold">Next Pool Reserve (20%)</th>
                  <th className="px-3 py-3 text-right font-semibold">System (10%)</th>
                  <th className="px-3 py-3 text-right font-semibold">Max Profit (10×)</th>
                  <th className="py-3 pl-3 pr-4 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700 dark:divide-gray-800 dark:text-gray-300">
                {rows.map((r) => {
                  const entry = r.entryAmount || 0;
                  const mult = r.collectionMultiplier || 2;
                  const collection = entry * mult;
                  const dist = r.distribution || {};
                  const walletPct = dist.walletPercent ?? 20;
                  const samePoolPct = dist.samePoolPercent ?? 50;
                  const nextPoolPct = dist.nextPoolPercent ?? 20;
                  const adminPct = dist.adminPercent ?? 5;
                  const featurePct = dist.featurePercent ?? 5;

                  const userProfit = Math.floor((collection * walletPct) / 100);
                  const reentry = Math.floor((collection * samePoolPct) / 100);
                  const isPool10 = r.poolLevel === 10;
                  const nextPoolAmount = isPool10 ? 0 : Math.floor((collection * nextPoolPct) / 100);
                  const systemAmount = Math.floor((collection * (adminPct + featurePct)) / 100);
                  const maxProfit = userProfit * (r.maxCycles || 10);

                  return (
                    <tr
                      key={r._id || r.poolLevel}
                      className="transition-colors hover:bg-gray-50/70 dark:hover:bg-white/[0.02]"
                    >
                      {/* Tier Name & Badge */}
                      <td className="py-3.5 pl-4 pr-3 font-medium">
                        <div className="flex items-center gap-2">
                          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-500/10 text-[11px] font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-400">
                            P{r.poolLevel}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            Pool {r.poolLevel}
                          </span>
                        </div>
                      </td>

                      {/* Entry Cost */}
                      <td className="px-3 py-3.5 text-right font-semibold text-gray-900 dark:text-white">
                        {formatNum(entry)}
                      </td>

                      {/* Intake (2x) */}
                      <td className="px-3 py-3.5 text-right font-medium text-gray-600 dark:text-gray-400">
                        {formatNum(collection)}
                      </td>

                      {/* User Profit (20%) */}
                      <td className="px-3 py-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400">
                        +{formatNum(userProfit)}
                      </td>

                      {/* Auto Re-entry (50%) */}
                      <td className="px-3 py-3.5 text-right font-medium text-gray-700 dark:text-gray-300">
                        {formatNum(reentry)}
                      </td>

                      {/* Next Pool Reserve (20%) */}
                      <td className="px-3 py-3.5 text-right font-medium">
                        {isPool10 ? (
                          <span className="text-[11px] text-gray-400 italic">Max Pool (to Feature)</span>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-gray-700 dark:text-gray-300">
                              {formatNum(nextPoolAmount)}
                            </span>
                            <span className="text-[10px] text-gray-400">
                              (5× = {formatNum(nextPoolAmount * 5)})
                            </span>
                          </div>
                        )}
                      </td>

                      {/* System Reserve (10%) */}
                      <td className="px-3 py-3.5 text-right font-medium text-gray-600 dark:text-gray-400">
                        {formatNum(systemAmount)}
                      </td>

                      {/* Max Total Profit across 10 cycles */}
                      <td className="px-3 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                        {formatNum(maxProfit)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 pl-3 pr-4 text-center">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            r.active
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          }`}
                        >
                          {r.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
