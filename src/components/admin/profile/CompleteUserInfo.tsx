"use client";

import { useCallback, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import User360SearchBar from "./user360/User360SearchBar";
import User360Insights from "./user360/User360Insights";
import User360LogsPanel from "./user360/User360LogsPanel";
import {
  fetchUser360Summary,
  parseSearchInput,
} from "./user360/user360Api";
import type { User360Summary } from "./user360/types";

export default function AdminUserCompleteInfo() {
  const [query, setQuery] = useState("");
  const [summary, setSummary] = useState<User360Summary | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = useCallback(async () => {
    const parsed = parseSearchInput(query);
    if (!parsed) {
      toast.warn("Enter an email or serial number");
      return;
    }

    setLoading(true);
    setSummary(null);
    try {
      const data = await fetchUser360Summary(parsed);
      setSummary(data);
      toast.success("User profile loaded");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load user";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
          User 360° view
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Search by email or serial number to view member insights and activity.
        </p>
        <div className="mt-4">
          <User360SearchBar
            value={query}
            onChange={setQuery}
            onSearch={handleSearch}
            loading={loading}
          />
        </div>
      </div>

      {summary ? (
        <>
          <User360Insights summary={summary} />
          <User360LogsPanel userId={summary.userId} />
        </>
      ) : null}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
