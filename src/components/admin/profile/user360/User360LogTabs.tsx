"use client";

import type { User360LogType } from "./types";
import { USER360_LOG_TABS } from "./types";

type Props = {
  activeTab: User360LogType;
  onTabChange: (tab: User360LogType) => void;
};

export default function User360LogTabs({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="flex gap-0 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 dark:border-gray-700 dark:bg-gray-900/50"
      role="tablist"
    >
      {USER360_LOG_TABS.map((t) => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onTabChange(t.id)}
            className={`flex-1 min-w-[120px] rounded-md px-3 py-2.5 text-sm font-medium whitespace-nowrap transition ${
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
  );
}
