"use client";

import React from "react";

export type LevelStat = {
  level: number;
  count: number;
  uniqueUsers: number;
};

export type PoolOverview = {
  poolType: string;
  totalRecords: number;
  uniqueUsers: number;
  byLevel: LevelStat[];
};

type Props = {
  weekly: PoolOverview;
  monthly: PoolOverview;
  poolType: "weekly" | "monthly";
};

export default function AchievementStats({ weekly, monthly, poolType }: Props) {
  const active = poolType === "monthly" ? monthly : weekly;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
      <StatCard label="Total achievements" value={String(active.totalRecords)} />
      <StatCard label="Unique achievers" value={String(active.uniqueUsers)} />
      <StatCard
        label="Weekly records"
        value={String(weekly.totalRecords)}
        sub="all levels"
      />
      <StatCard
        label="Monthly records"
        value={String(monthly.totalRecords)}
        sub="all levels"
      />
      <div className="sm:col-span-2 lg:col-span-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
          By level ({poolType})
        </p>
        <div className="flex flex-wrap gap-2">
          {active.byLevel.length === 0 ? (
            <span className="text-sm text-gray-500">No data</span>
          ) : (
            active.byLevel.map((l) => (
              <span
                key={l.level}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200"
              >
                L{l.level}: {l.count} ({l.uniqueUsers} users)
              </span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {sub ? (
        <p className="text-xs text-gray-400 mt-1">{sub}</p>
      ) : null}
    </div>
  );
}
