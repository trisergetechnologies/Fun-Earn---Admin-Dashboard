/** Shared table / panel classes for system wallet views */
export const WALLET_TABLE = {
  shell:
    "overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]",
  scroll: "max-w-full overflow-x-auto",
  header: "bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700",
  headerCell:
    "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap",
  body: "divide-y divide-gray-100 dark:divide-gray-800",
  cell: "px-5 py-4 text-sm align-middle text-gray-800 dark:text-gray-200",
  cellMuted: "text-xs text-gray-500 dark:text-gray-400",
  rowHover:
    "transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02] even:bg-gray-50/30 dark:even:bg-white/[0.01]",
  empty: "px-5 py-14 text-center text-sm text-gray-500 dark:text-gray-400",
  mobileCard:
    "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] space-y-3",
  footer:
    "flex flex-col gap-3 border-t border-gray-100 bg-gray-50/50 px-5 py-4 dark:border-gray-800 dark:bg-gray-900/20 sm:flex-row sm:items-center sm:justify-between",
} as const;

export const WALLET_INPUT =
  "w-full rounded-lg border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100";

export const WALLET_LABEL =
  "mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";
