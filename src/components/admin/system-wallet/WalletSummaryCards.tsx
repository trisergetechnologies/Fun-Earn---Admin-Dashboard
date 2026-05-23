"use client";

import type { WalletState } from "./types/wallet";

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: "indigo" | "emerald" | "rose";
}) {
  const accentBar = {
    indigo: "bg-indigo-500",
    emerald: "bg-emerald-500",
    rose: "bg-rose-500",
  }[accent];

  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className={`absolute left-0 top-0 h-full w-1 ${accentBar}`} aria-hidden />
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900 dark:text-white sm:text-3xl">
        {value}
      </p>
    </div>
  );
}

export default function WalletSummaryCards({ wallet }: { wallet: WalletState }) {
  return (
    <section aria-label="Wallet balances">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        Balances
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total balance"
          value={`₹${wallet.totalBalance.toFixed(2)}`}
          accent="indigo"
        />
        <StatCard
          label="Weekly pool"
          value={`₹${wallet.weeklyPool.toFixed(2)}`}
          accent="emerald"
        />
        <StatCard
          label="Monthly pool"
          value={`₹${wallet.monthlyPool.toFixed(2)}`}
          accent="rose"
        />
      </div>
    </section>
  );
}
