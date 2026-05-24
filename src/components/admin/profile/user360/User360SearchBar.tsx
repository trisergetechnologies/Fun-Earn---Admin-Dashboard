"use client";

import { WALLET_INPUT } from "@/components/admin/system-wallet/walletTableStyles";
import { Search } from "lucide-react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSearch: () => void;
  loading: boolean;
};

export default function User360SearchBar({
  value,
  onChange,
  onSearch,
  loading,
}: Props) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch();
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 min-w-0">
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Find member
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            type="text"
            placeholder="Email or serial number"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`${WALLET_INPUT} pl-10`}
            disabled={loading}
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex h-[42px] shrink-0 items-center justify-center rounded-lg bg-indigo-600 px-5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 sm:min-w-[120px]"
      >
        {loading ? "Searching…" : "Search"}
      </button>
    </form>
  );
}
