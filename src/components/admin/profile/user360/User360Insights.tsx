"use client";

import { CheckCircle, User } from "lucide-react";
import type { User360Summary } from "./types";
import { fmt, formatWatchTime } from "./format";

type Props = {
  summary: User360Summary;
};

function InsightCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-gray-900 dark:text-white">
        {value}
      </p>
      {sub ? (
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{sub}</p>
      ) : null}
    </div>
  );
}

export default function User360Insights({ summary }: Props) {
  const { user } = summary;
  const pkg = user.package;

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-5 dark:border-gray-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white/20">
                <User className="h-7 w-7 text-white" />
              </div>
              <div className="min-w-0 text-white">
                <h2 className="text-xl font-bold truncate">{user.name}</h2>
                <p className="mt-1 text-sm text-indigo-100">
                  #{summary.serialNumber ?? "—"} · {user.email || "—"}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-xs font-medium capitalize">
                    {user.role || "user"}
                  </span>
                  {pkg?.name ? (
                    <span className="rounded-md bg-white/25 px-2.5 py-0.5 text-xs font-medium">
                      {pkg.name}
                      {typeof pkg.price === "number" ? ` · ${fmt(pkg.price)}` : ""}
                    </span>
                  ) : (
                    <span className="rounded-md bg-white/15 px-2.5 py-0.5 text-xs">
                      No package
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-sm text-indigo-100 shrink-0">
              <p>Phone: {user.phone || "—"}</p>
              <p className="mt-1">Referral: {summary.referralCode || "—"}</p>
              <p className="mt-1">Referred by: {summary.referredBy || "—"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3 lg:grid-cols-6">
          <InsightCard
            label="Short video wallet"
            value={fmt(summary.wallets?.shortVideoWallet)}
          />
          <InsightCard
            label="eCart wallet"
            value={fmt(summary.wallets?.eCartWallet)}
          />
          <InsightCard
            label="Total earned"
            value={fmt(summary.earningLogSummary.totalEarned)}
            sub={`${summary.earningLogSummary.totalEarningLogs} logs`}
          />
          <InsightCard
            label="Direct referrals"
            value={String(summary.referralCount)}
          />
          <InsightCard
            label="Watch time"
            value={formatWatchTime(summary.shortVideoProfile?.watchTime)}
          />
          <InsightCard
            label="Video uploads"
            value={String(summary.videoUploadCount)}
            sub={`${summary.counts.videos} total videos`}
          />
        </div>
      </div>

      {summary.achievements.length > 0 ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 dark:text-white">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            Achievements
          </h3>
          <div className="flex flex-wrap gap-2">
            {summary.achievements.map((a) => (
              <span
                key={a._id}
                className="inline-flex items-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300"
              >
                L{a.level} · {a.title}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
