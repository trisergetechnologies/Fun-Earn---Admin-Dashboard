"use client";

import { X } from "lucide-react";
import type { EligibleMember, EligibleMeta } from "./types/wallet";

const CHIP_COLORS = [
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
];

type Props = {
  member: EligibleMember | null;
  meta: EligibleMeta | null;
  onClose: () => void;
};

export default function MemberDetailDrawer({ member, meta, onClose }: Props) {
  if (!member) return null;

  return (
    <div className="fixed inset-0 z-[9998] flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-2xl dark:bg-gray-900">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{member.name}</h2>
            <p className="text-sm text-gray-500">#{member.serialNumber ?? "—"}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <section className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-800/40">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Member details
            </h3>
            <dl className="mt-3 space-y-2.5 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Referral</dt>
                <dd className="font-mono font-medium text-gray-900 dark:text-white">
                  {member.referralCode}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Package</dt>
                <dd className="text-gray-900 dark:text-white">{member.packageName || "—"}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">New buyers</dt>
                <dd className="font-semibold tabular-nums text-gray-900 dark:text-white">
                  {member.newBuyersSinceLastPayout}
                  <span className="ml-1 font-normal text-gray-500">
                    {meta?.lastPayoutAt
                      ? `since ${new Date(meta.lastPayoutAt).toLocaleDateString()}`
                      : "(first payout)"}
                  </span>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Eligible levels</dt>
                <dd className="text-right text-gray-900 dark:text-white">
                  {member.eligibleLevelLabels || "—"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="mt-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Achievements
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {member.achievements.map((a) => (
                <span
                  key={`${a.level}-${a.title}`}
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    CHIP_COLORS[(a.level - 1) % CHIP_COLORS.length]
                  }`}
                >
                  L{a.level}: {a.title}
                </span>
              ))}
            </div>
          </section>

          {meta?.eligibilityRulesActive && member.minNewBuyersRequired != null ? (
            <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
              Activity gate: up to {member.minNewBuyersRequired} new downline buyers required for
              gated levels (current: {member.newBuyersSinceLastPayout}).
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
