"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";
import Pagination from "@/components/admin/users/Pagination";
import WalletSummaryCards from "./WalletSummaryCards";
import WalletActionBar from "./WalletActionBar";
import WalletFilterBar from "./WalletFilterBar";
import WalletDataPanel from "./WalletDataPanel";
import WalletTableFooter from "./WalletTableFooter";
import SystemLogsTable from "./SystemLogsTable";
import EligibleMembersTable from "./EligibleMembersTable";
import MemberDetailDrawer from "./MemberDetailDrawer";
import type {
  EligibleFilters,
  EligibleMember,
  EligibleMeta,
  LogsFilters,
  SystemLog,
  WalletState,
  WalletTab,
} from "./types/wallet";

const TABS: { id: WalletTab; label: string }[] = [
  { id: "logs", label: "System In/Out Logs" },
  { id: "weekly", label: "Weekly Eligible" },
  { id: "monthly", label: "Monthly Eligible" },
];

const defaultLogsFilters: LogsFilters = { search: "", type: "all", source: "all" };
const defaultEligibleFilters: EligibleFilters = { search: "", level: "all" };

export default function SystemWalletPage() {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  const [wallet, setWallet] = useState<WalletState | null>(null);
  const [activeTab, setActiveTab] = useState<WalletTab>("logs");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [logsFilters, setLogsFilters] = useState<LogsFilters>(defaultLogsFilters);
  const [logsApplied, setLogsApplied] = useState<LogsFilters>(defaultLogsFilters);
  const [weeklyFilters, setWeeklyFilters] = useState<EligibleFilters>(defaultEligibleFilters);
  const [weeklyApplied, setWeeklyApplied] = useState<EligibleFilters>(defaultEligibleFilters);
  const [monthlyFilters, setMonthlyFilters] = useState<EligibleFilters>(defaultEligibleFilters);
  const [monthlyApplied, setMonthlyApplied] = useState<EligibleFilters>(defaultEligibleFilters);

  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotal, setLogsTotal] = useState(0);

  const [weeklyUsers, setWeeklyUsers] = useState<EligibleMember[]>([]);
  const [weeklyMeta, setWeeklyMeta] = useState<EligibleMeta | null>(null);
  const [weeklyPage, setWeeklyPage] = useState(1);
  const [weeklyTotalPages, setWeeklyTotalPages] = useState(1);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const weeklyLoaded = useRef(false);

  const [monthlyUsers, setMonthlyUsers] = useState<EligibleMember[]>([]);
  const [monthlyMeta, setMonthlyMeta] = useState<EligibleMeta | null>(null);
  const [monthlyPage, setMonthlyPage] = useState(1);
  const [monthlyTotalPages, setMonthlyTotalPages] = useState(1);
  const [monthlyTotal, setMonthlyTotal] = useState(0);
  const monthlyLoaded = useRef(false);

  const [drawerMember, setDrawerMember] = useState<EligibleMember | null>(null);
  const [drawerMeta, setDrawerMeta] = useState<EligibleMeta | null>(null);

  const limit = 20;
  const eligibleCacheBust = useRef(0);

  const fetchWallet = useCallback(async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${base}/shortvideo/admin/getsystemwallet`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data?.data) setWallet(res.data.data);
    } catch {
      toast.error("Failed to load wallet");
    }
  }, [token, base]);

  const fetchLogs = useCallback(
    async (pageNum: number, filters: LogsFilters) => {
      if (!token) return;
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          page: pageNum,
          limit,
        };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.type !== "all") params.type = filters.type;
        if (filters.source !== "all") params.source = filters.source;

        const res = await axios.get(`${base}/shortvideo/admin/getsystemearninglogs`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setLogs(res.data?.data?.logs ?? []);
        setLogsTotalPages(res.data?.data?.pagination?.totalPages ?? 1);
        setLogsTotal(res.data?.data?.pagination?.total ?? 0);
      } catch {
        toast.error("Failed to load logs");
      } finally {
        setLoading(false);
      }
    },
    [token, base]
  );

  const fetchEligible = useCallback(
    async (poolType: "weekly" | "monthly", pageNum: number, filters: EligibleFilters) => {
      if (!token) return;
      setLoading(true);
      try {
        const params: Record<string, string | number> = {
          poolType,
          page: pageNum,
          limit,
          _t: eligibleCacheBust.current,
        };
        if (filters.search.trim()) params.search = filters.search.trim();
        if (filters.level !== "all") params.level = filters.level;

        const res = await axios.get(`${base}/shortvideo/admin/rewards/payout-eligible`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        const data = res.data?.data;
        if (poolType === "weekly") {
          setWeeklyUsers(data?.users ?? []);
          setWeeklyMeta(data?.meta ?? null);
          setWeeklyTotalPages(data?.pagination?.totalPages ?? 1);
          setWeeklyTotal(data?.pagination?.total ?? 0);
          weeklyLoaded.current = true;
        } else {
          setMonthlyUsers(data?.users ?? []);
          setMonthlyMeta(data?.meta ?? null);
          setMonthlyTotalPages(data?.pagination?.totalPages ?? 1);
          setMonthlyTotal(data?.pagination?.total ?? 0);
          monthlyLoaded.current = true;
        }
      } catch {
        toast.error(`Failed to load ${poolType} eligible list`);
      } finally {
        setLoading(false);
      }
    },
    [token, base]
  );

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (activeTab === "logs") fetchLogs(logsPage, logsApplied);
  }, [activeTab, logsPage, logsApplied, fetchLogs]);

  useEffect(() => {
    if (activeTab === "weekly") fetchEligible("weekly", weeklyPage, weeklyApplied);
  }, [activeTab, weeklyPage, weeklyApplied, fetchEligible]);

  useEffect(() => {
    if (activeTab === "monthly") fetchEligible("monthly", monthlyPage, monthlyApplied);
  }, [activeTab, monthlyPage, monthlyApplied, fetchEligible]);

  const handleTabChange = (tab: WalletTab) => {
    setActiveTab(tab);
    if (tab === "logs") setLogsPage(1);
    if (tab === "weekly") setWeeklyPage(1);
    if (tab === "monthly") setMonthlyPage(1);
  };

  const handleApplyFilters = () => {
    if (activeTab === "logs") {
      setLogsApplied(logsFilters);
      setLogsPage(1);
    } else if (activeTab === "weekly") {
      setWeeklyApplied(weeklyFilters);
      setWeeklyPage(1);
    } else {
      setMonthlyApplied(monthlyFilters);
      setMonthlyPage(1);
    }
  };

  const refreshAfterPayout = () => {
    eligibleCacheBust.current += 1;
    weeklyLoaded.current = false;
    monthlyLoaded.current = false;
    fetchWallet();
    if (activeTab === "logs") fetchLogs(logsPage, logsApplied);
    if (weeklyLoaded.current || activeTab === "weekly") {
      fetchEligible("weekly", weeklyPage, weeklyApplied);
    }
    if (monthlyLoaded.current || activeTab === "monthly") {
      fetchEligible("monthly", monthlyPage, monthlyApplied);
    }
  };

  const panelSubtitle = () => {
    if (activeTab === "logs") {
      return "All system wallet inflows and outflows.";
    }
    const poolType = activeTab === "weekly" ? "weekly" : "monthly";
    const meta = activeTab === "weekly" ? weeklyMeta : monthlyMeta;
    const poolAmt =
      wallet && poolType === "weekly" ? wallet.weeklyPool : wallet?.monthlyPool;
    const last = meta?.lastPayoutAt
      ? new Date(meta.lastPayoutAt).toLocaleString()
      : "First payout";
    const rules = meta?.eligibilityRulesActive ? "Activity rules on" : "No activity gate";
    return (
      <>
        <span className="capitalize font-medium text-gray-700 dark:text-gray-300">
          {poolType}
        </span>
        {poolAmt != null ? ` pool · ₹${poolAmt.toFixed(2)}` : ""} · Last payout: {last} · {rules}
        {meta?.cachedAt ? (
          <span className="text-gray-400"> · list cached ~5 min</span>
        ) : null}
      </>
    );
  };

  const footerSummary = () => {
    if (activeTab === "logs") {
      return `${logsTotal} total records · showing ${logs.length} on this page`;
    }
    const total = activeTab === "weekly" ? weeklyTotal : monthlyTotal;
    const users = activeTab === "weekly" ? weeklyUsers : monthlyUsers;
    return `${total} eligible members · ${users.length} on this page`;
  };

  const currentTotalPages =
    activeTab === "logs"
      ? logsTotalPages
      : activeTab === "weekly"
        ? weeklyTotalPages
        : monthlyTotalPages;
  const currentPage =
    activeTab === "logs" ? logsPage : activeTab === "weekly" ? weeklyPage : monthlyPage;
  const onPageChange =
    activeTab === "logs"
      ? setLogsPage
      : activeTab === "weekly"
        ? setWeeklyPage
        : setMonthlyPage;

  const eligibleFilters =
    activeTab === "weekly" ? weeklyFilters : monthlyFilters;
  const setEligibleFilters =
    activeTab === "weekly" ? setWeeklyFilters : setMonthlyFilters;

  return (
    <div className="space-y-6">
      {wallet ? <WalletSummaryCards wallet={wallet} /> : null}

      <WalletActionBar
        wallet={wallet}
        onWalletChange={setWallet}
        onAfterPayout={refreshAfterPayout}
        loading={actionLoading}
        setLoading={setActionLoading}
      />

      <WalletDataPanel
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        subtitle={panelSubtitle()}
        filters={
          <WalletFilterBar
            activeTab={activeTab}
            logsFilters={logsFilters}
            eligibleFilters={eligibleFilters}
            onLogsChange={setLogsFilters}
            onEligibleChange={setEligibleFilters}
            onApply={handleApplyFilters}
          />
        }
        footer={
          <WalletTableFooter
            summary={footerSummary()}
            pagination={
              currentTotalPages > 1 ? (
                <Pagination
                  currentPage={currentPage}
                  totalPages={currentTotalPages}
                  onPageChange={onPageChange}
                />
              ) : undefined
            }
          />
        }
      >
        {activeTab === "logs" ? (
          <SystemLogsTable logs={logs} loading={loading} />
        ) : (
          <EligibleMembersTable
            users={activeTab === "weekly" ? weeklyUsers : monthlyUsers}
            meta={activeTab === "weekly" ? weeklyMeta : monthlyMeta}
            loading={loading}
            onSelect={(m) => {
              setDrawerMember(m);
              setDrawerMeta(activeTab === "weekly" ? weeklyMeta : monthlyMeta);
            }}
          />
        )}
      </WalletDataPanel>

      <MemberDetailDrawer
        member={drawerMember}
        meta={drawerMeta}
        onClose={() => {
          setDrawerMember(null);
          setDrawerMeta(null);
        }}
      />

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
