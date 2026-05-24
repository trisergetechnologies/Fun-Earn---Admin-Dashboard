"use client";

import Pagination from "@/components/admin/users/Pagination";
import WalletTableFooter from "@/components/admin/system-wallet/WalletTableFooter";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { fetchUser360Logs } from "./user360Api";
import User360LogTabs from "./User360LogTabs";
import User360LogTables from "./User360LogTables";
import type { User360LogType, User360Pagination } from "./types";

const PAGE_SIZE = 20;

type Props = {
  userId: string;
};

export default function User360LogsPanel({ userId }: Props) {
  const [activeTab, setActiveTab] = useState<User360LogType>("earningLogs");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState<unknown[]>([]);
  const [pagination, setPagination] = useState<User360Pagination | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLogs = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const data = await fetchUser360Logs(userId, activeTab, page, PAGE_SIZE);
      setItems(data.items);
      setPagination(data.pagination);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load logs";
      toast.error(msg);
      setItems([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [userId, activeTab, page]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  const handleTabChange = (tab: User360LogType) => {
    setActiveTab(tab);
    setPage(1);
  };

  const total = pagination?.total ?? 0;
  const totalPages = pagination?.totalPages ?? 1;
  const summary =
    total === 0
      ? "No records"
      : `${total} total records · showing ${items.length} on this page`;

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="border-b border-gray-100 px-5 pt-5 dark:border-gray-800 sm:px-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Activity & records
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Paginated history for this member
        </p>
        <div className="mt-4">
          <User360LogTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      <User360LogTables logType={activeTab} items={items} loading={loading} />

      <WalletTableFooter
        summary={summary}
        pagination={
          totalPages > 1 ? (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : undefined
        }
      />
    </section>
  );
}
