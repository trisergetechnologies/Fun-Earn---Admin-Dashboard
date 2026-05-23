"use client";

import type { EligibleFilters, LogsFilters, WalletTab } from "./types/wallet";
import { LOG_SOURCES, SOURCE_LABELS } from "./types/wallet";
import { WALLET_INPUT, WALLET_LABEL } from "./walletTableStyles";

type Props = {
  activeTab: WalletTab;
  logsFilters: LogsFilters;
  eligibleFilters: EligibleFilters;
  onLogsChange: (f: LogsFilters) => void;
  onEligibleChange: (f: EligibleFilters) => void;
  onApply: () => void;
};

export default function WalletFilterBar({
  activeTab,
  logsFilters,
  eligibleFilters,
  onLogsChange,
  onEligibleChange,
  onApply,
}: Props) {
  const isLogs = activeTab === "logs";

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="min-w-0 flex-1 lg:min-w-[240px]">
        <label className={WALLET_LABEL} htmlFor="wallet-search">
          Search
        </label>
        <input
          id="wallet-search"
          type="text"
          placeholder={
            isLogs
              ? "Source, context, status, name, serial…"
              : "Name, referral, serial…"
          }
          value={isLogs ? logsFilters.search : eligibleFilters.search}
          onChange={(e) =>
            isLogs
              ? onLogsChange({ ...logsFilters, search: e.target.value })
              : onEligibleChange({ ...eligibleFilters, search: e.target.value })
          }
          onKeyDown={(e) => e.key === "Enter" && onApply()}
          className={WALLET_INPUT}
        />
      </div>

      {isLogs ? (
        <>
          <div className="w-full sm:w-40">
            <label className={WALLET_LABEL} htmlFor="wallet-type">
              Type
            </label>
            <select
              id="wallet-type"
              value={logsFilters.type}
              onChange={(e) =>
                onLogsChange({
                  ...logsFilters,
                  type: e.target.value as LogsFilters["type"],
                })
              }
              className={WALLET_INPUT}
            >
              <option value="all">All types</option>
              <option value="inflow">Inflow</option>
              <option value="outflow">Outflow</option>
            </select>
          </div>
          <div className="w-full sm:w-48">
            <label className={WALLET_LABEL} htmlFor="wallet-source">
              Source
            </label>
            <select
              id="wallet-source"
              value={logsFilters.source}
              onChange={(e) => onLogsChange({ ...logsFilters, source: e.target.value })}
              className={WALLET_INPUT}
            >
              <option value="all">All sources</option>
              {LOG_SOURCES.map((s) => (
                <option key={s} value={s}>
                  {SOURCE_LABELS[s] || s}
                </option>
              ))}
            </select>
          </div>
        </>
      ) : (
        <div className="w-full sm:w-44">
          <label className={WALLET_LABEL} htmlFor="wallet-level">
            Level
          </label>
          <select
            id="wallet-level"
            value={eligibleFilters.level}
            onChange={(e) => onEligibleChange({ ...eligibleFilters, level: e.target.value })}
            className={WALLET_INPUT}
          >
            <option value="all">All levels</option>
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                Has level {n}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex shrink-0 items-end">
        <button
          type="button"
          onClick={onApply}
          className="w-full rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 sm:w-auto"
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}
