"use client";

import type { ReactNode } from "react";
import type { WalletTab } from "./types/wallet";

type TabDef = { id: WalletTab; label: string };

type Props = {
  tabs: TabDef[];
  activeTab: WalletTab;
  onTabChange: (tab: WalletTab) => void;
  subtitle: ReactNode;
  filters: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export default function WalletDataPanel({
  tabs,
  activeTab,
  onTabChange,
  subtitle,
  filters,
  children,
  footer,
}: Props) {
  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 pt-5 dark:border-gray-800 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              Records & eligibility
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
          </div>
        </div>

        <div
          className="mt-5 flex gap-0 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50"
          role="tablist"
        >
          {tabs.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 min-w-[140px] rounded-md px-4 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  active
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-gray-800 dark:text-indigo-300"
                    : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/30 sm:px-6">
        {filters}
      </div>

      <div className="p-4 sm:p-6 sm:pt-5">{children}</div>

      {footer ? (
        <div className="border-t border-gray-100 dark:border-gray-800">{footer}</div>
      ) : null}
    </section>
  );
}
