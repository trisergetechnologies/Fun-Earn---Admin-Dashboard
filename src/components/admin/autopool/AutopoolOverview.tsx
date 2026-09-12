"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";
import {
  Activity,
  Layers,
  Users,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Sparkles,
} from "lucide-react";

type PoolStat = {
  poolLevel: number;
  entryAmount: number;
  active: boolean;
  maxCycles: number;
  activeMembers: number;
  totalCycles: number;
};

type OverviewData = {
  enabled: boolean;
  enabledSource?: string;
  bootstrapUserId?: string | null;
  poolCount: number;
  occupyingParticipations: number;
  totalCyclesCompleted: number;
  featureReserve: number;
  adminAllocation: number;
  pools?: PoolStat[];
};

export default function AutopoolOverview() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await autopoolAdmin("/health");
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-5">
      {/* Top Header Card */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Auto Pool Overview
            </h2>
            {data && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  data.enabled
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                    : "bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    data.enabled ? "bg-emerald-500" : "bg-red-500"
                  }`}
                />
                {data.enabled ? "Active" : "Disabled"}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            System status, cross-pool active member distribution, and reserve balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/autopool/matrix"
            className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            <span>Open Live Matrix</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Refresh overview metrics"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
          <strong>Error loading overview:</strong> {error}
          <button
            onClick={load}
            className="ml-3 font-semibold underline hover:no-underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Top 4 Key Macro Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Stat 1: System Status */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              System Mode
            </span>
            <Activity className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {data ? (data.enabled ? "Active" : "Disabled") : "—"}
            </span>
            {data?.enabledSource && (
              <span className="text-[11px] text-gray-400">
                via {data.enabledSource}
              </span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            {data?.poolCount ?? 10} pools configured
          </div>
        </div>

        {/* Stat 2: Active Members */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              Active Members
            </span>
            <Users className="h-4 w-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {data?.occupyingParticipations ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Occupying seats across all pools
          </div>
        </div>

        {/* Stat 3: Total Cycles Completed */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              Total Cycles Done
            </span>
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {data?.totalCyclesCompleted ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Completed payout rounds
          </div>
        </div>

        {/* Stat 4: System Reserves */}
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
            <span className="text-xs font-medium uppercase tracking-wider">
              System Reserves
            </span>
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="mt-2 text-xl font-bold text-gray-900 dark:text-white">
            {(data?.adminAllocation ?? 0) + (data?.featureReserve ?? 0)}
          </div>
          <div className="mt-1 text-[11px] text-gray-500">
            Admin: {data?.adminAllocation ?? 0} · Feature: {data?.featureReserve ?? 0}
          </div>
        </div>
      </div>

      {/* 10-Pool Multi-Pool At-A-Glance Grid */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-gray-800">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
              Pool Status & Distribution (Pools 1 – 10)
            </h3>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Live member counts and cycle progression for each pool tier.
            </p>
          </div>
          <Link
            href="/admin/autopool/pools"
            className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400"
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Edit Configs</span>
          </Link>
        </div>

        {loading && !data && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.03]"
              />
            ))}
          </div>
        )}

        {data?.pools && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {data.pools.map((p) => {
              const hasActivity = p.activeMembers > 0 || p.totalCycles > 0;
              return (
                <div
                  key={p.poolLevel}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 transition hover:shadow-sm ${
                    hasActivity
                      ? "border-brand-200 bg-brand-50/20 dark:border-brand-900/40 dark:bg-brand-950/10"
                      : "border-gray-100 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.01]"
                  }`}
                >
                  <div>
                    {/* Header: Pool Level & Entry Amount */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">
                        Pool {p.poolLevel}
                      </span>
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        Entry {p.entryAmount}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="mt-3 space-y-1 text-xs">
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>Active Members:</span>
                        <strong className="text-gray-900 dark:text-white">
                          {p.activeMembers}
                        </strong>
                      </div>
                      <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
                        <span>Cycles Done:</span>
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {p.totalCycles}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Action Link to Matrix */}
                  <div className="mt-3 border-t border-gray-100 pt-2.5 dark:border-gray-800">
                    <Link
                      href={`/admin/autopool/matrix?pool=${p.poolLevel}`}
                      className="inline-flex w-full items-center justify-between text-xs font-semibold text-brand-600 transition hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      <span>View Live Tree</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Navigation Strip */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          href="/admin/autopool/matrix"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/20 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Live Binary Tree & FIFO Queue
              </div>
              <p className="text-[11px] text-gray-500">
                Visual seat matrix, next-fill projection & member journeys
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>

        <Link
          href="/admin/autopool/pools"
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50/20 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-brand-800"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white">
                Pool Configurations & Rules
              </div>
              <p className="text-[11px] text-gray-500">
                Entry amounts, multiplier, and 5-way cycle distribution splits
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400" />
        </Link>
      </div>
    </div>
  );
}
