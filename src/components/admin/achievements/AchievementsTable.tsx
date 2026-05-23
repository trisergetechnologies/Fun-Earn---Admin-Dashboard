"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Pagination from "@/components/admin/users/Pagination";
import { getToken } from "@/helper/tokenHelper";
import AchievementStats, { PoolOverview } from "./AchievementStats";

export type AchievementRow = {
  id: string;
  userId: string;
  name: string;
  email: string;
  serialNumber: number | null;
  referralCode: string;
  packageName: string | null;
  level: number;
  title: string;
  achievedAt: string;
};

const BASE = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin`;

export default function AchievementsTable() {
  const [poolType, setPoolType] = useState<"weekly" | "monthly">("weekly");
  const [rows, setRows] = useState<AchievementRow[]>([]);
  const [weeklyOverview, setWeeklyOverview] = useState<PoolOverview | null>(null);
  const [monthlyOverview, setMonthlyOverview] = useState<PoolOverview | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState<string>("all");
  const [sortField, setSortField] = useState("achievedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const limit = 20;

  const token = getToken();

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${BASE()}/achievements/overview`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.success && res.data.data) {
        setWeeklyOverview(res.data.data.weekly);
        setMonthlyOverview(res.data.data.monthly);
      }
    } catch (e) {
      console.error(e);
    }
  }, [token]);

  const fetchList = useCallback(
    async (pageNum: number) => {
      if (!token) return;
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          poolType,
          page: pageNum,
          limit,
          sortField,
          sortOrder,
        };
        if (search.trim()) params.search = search.trim();
        if (level !== "all") params.level = level;

        const res = await axios.get(`${BASE()}/achievements`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (res.data?.success && res.data.data) {
          setRows(res.data.data.rows || []);
          setTotalPages(res.data.data.pagination?.totalPages || 1);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [token, poolType, search, level, sortField, sortOrder]
  );

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  useEffect(() => {
    fetchList(page);
  }, [fetchList, page]);

  const applyFilters = () => {
    setPage(1);
    fetchList(1);
  };

  return (
    <div>
      {weeklyOverview && monthlyOverview ? (
        <AchievementStats
          weekly={weeklyOverview}
          monthly={monthlyOverview}
          poolType={poolType}
        />
      ) : null}

      <div className="flex flex-col gap-3 mb-4 md:flex-row md:flex-wrap md:items-center">
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(["weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setPoolType(p);
                setPage(1);
              }}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                poolType === p
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search name, email, referral, serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && applyFilters()}
          className="border px-3 py-2 rounded-md flex-1 min-w-[200px] dark:bg-gray-800 dark:border-gray-700"
        />
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="all">All levels</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              Level {n}
            </option>
          ))}
        </select>
        <select
          value={sortField}
          onChange={(e) => setSortField(e.target.value)}
          className="border px-3 py-2 rounded-md dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="achievedAt">Achieved date</option>
          <option value="level">Level</option>
          <option value="name">Name</option>
          <option value="serialNumber">Serial</option>
        </select>
        <button
          type="button"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
          className="px-3 py-2 rounded-md border dark:border-gray-700"
        >
          {sortOrder === "asc" ? "↑" : "↓"}
        </button>
        <button
          type="button"
          onClick={applyFilters}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Apply
        </button>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-white/[0.05]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableCell isHeader>Serial</TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Referral</TableCell>
              <TableCell isHeader>Package</TableCell>
              <TableCell isHeader>Level</TableCell>
              <TableCell isHeader>Achievement</TableCell>
              <TableCell isHeader>Achieved</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell className="text-center py-8">Loading...</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8">No achievements found</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>#{r.serialNumber ?? "—"}</TableCell>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.referralCode}</TableCell>
                  <TableCell>{r.packageName || "—"}</TableCell>
                  <TableCell>L{r.level}</TableCell>
                  <TableCell>
                    <span className="inline-block max-w-[220px] truncate rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                      {r.title}
                    </span>
                  </TableCell>
                  <TableCell>
                    {r.achievedAt
                      ? new Date(r.achievedAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex justify-end">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
