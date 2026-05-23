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

type AchievementChip = { level: number; title: string };

type EligibleUser = {
  userId: string;
  name: string;
  serialNumber: number | null;
  referralCode: string;
  packageName: string | null;
  achievements: AchievementChip[];
  eligibleLevels: number[];
  newBuyersSinceLastPayout: number;
};

type Meta = {
  poolType: string;
  eligibilityRulesActive: boolean;
  lastPayoutAt: string | null;
  thresholds: Record<string, number>;
  cachedAt?: string;
};

const CHIP_COLORS = [
  "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200",
  "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
];

const BASE = () =>
  `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin`;

export default function PayoutEligibleTable() {
  const [poolType, setPoolType] = useState<"weekly" | "monthly">("weekly");
  const [users, setUsers] = useState<EligibleUser[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [search, setSearch] = useState("");
  const [level, setLevel] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [warmNote, setWarmNote] = useState<string | null>(null);
  const limit = 20;

  const token = getToken();

  const fetchList = useCallback(
    async (pageNum: number) => {
      if (!token) return;
      setLoading(true);
      setWarmNote(null);
      try {
        const params: Record<string, string | number> = {
          poolType,
          page: pageNum,
          limit,
        };
        if (search.trim()) params.search = search.trim();
        if (level !== "all") params.level = level;

        const res = await axios.get(`${BASE()}/rewards/payout-eligible`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        if (res.data?.success && res.data.data) {
          setUsers(res.data.data.users || []);
          setMeta(res.data.data.meta || null);
          setTotalPages(res.data.data.pagination?.totalPages || 1);
          if (res.data.data.meta?.cachedAt) {
            setWarmNote(
              "List cached ~5 min for speed. Refresh page after payouts to rebuild."
            );
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [token, poolType, search, level]
  );

  useEffect(() => {
    fetchList(page);
  }, [fetchList, page]);

  const applyFilters = () => {
    setPage(1);
    fetchList(1);
  };

  const lastLabel = meta?.lastPayoutAt
    ? new Date(meta.lastPayoutAt).toLocaleString()
    : "First payout";

  return (
    <div>
      {meta ? (
        <div className="mb-4 rounded-xl border border-gray-200 bg-indigo-50/50 p-4 text-sm dark:border-gray-800 dark:bg-indigo-900/20">
          <p className="text-gray-800 dark:text-gray-200">
            <span className="font-semibold capitalize">{meta.poolType}</span> next
            payout · Last payout: {lastLabel}
            {meta.eligibilityRulesActive
              ? " · Activity rules on"
              : " · No activity gate"}
          </p>
          {warmNote ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{warmNote}</p>
          ) : null}
        </div>
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
          placeholder="Search name, referral, serial..."
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
              Has level {n}
            </option>
          ))}
        </select>
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
              <TableCell isHeader>Achievements</TableCell>
              <TableCell isHeader>New buyers</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell className="text-center py-8">
                  Loading… first load may take a moment
                </TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell className="text-center py-8">
                  No payout-eligible members
                </TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
                <TableCell>{""}</TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.userId}>
                  <TableCell>#{u.serialNumber ?? "—"}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.referralCode}</TableCell>
                  <TableCell>{u.packageName || "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                      {u.achievements.map((a) => (
                        <span
                          key={`${a.level}-${a.title}`}
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            CHIP_COLORS[(a.level - 1) % CHIP_COLORS.length]
                          }`}
                          title={`L${a.level}`}
                        >
                          {a.title}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{u.newBuyersSinceLastPayout}</TableCell>
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
