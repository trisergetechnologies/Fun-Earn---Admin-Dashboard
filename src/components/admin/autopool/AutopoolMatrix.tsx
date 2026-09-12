"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";
import {
  Wallet,
  Coins,
  Clock,
  Users,
  TrendingUp,
  Sparkles,
  X,
  Repeat,
  Award,
  Info,
  List,
  LayoutGrid,
  CheckCircle2,
  ArrowUpRight,
} from "lucide-react";

type UserBrief = { _id?: string; name?: string; serialNumber?: number } | null;

type JourneyData = {
  participation: {
    _id: string;
    poolLevel: number;
    status: string;
    cycleCount: number;
    entryType: string;
    entryAmount: number;
    nextPoolEligibleAmount: number;
    isBootstrap: boolean;
    releasedAt: string | null;
    startedAt: string | null;
    completedAt: string | null;
    maxCycles: number;
    user: {
      _id?: string;
      name?: string;
      email?: string;
      serialNumber?: number;
    } | null;
  };
  wallets: {
    eCartWallet: number;
    shortVideoWallet: number;
  };
  earnings: {
    poolEarnings: number;
    totalEarnings: number;
    thisParticipationEarnings: number;
    poolCycleCount: number;
    totalCycleCount: number;
  };
  waitingInfo: {
    status: "IN_QUEUE" | "COMPLETED_ALL_CYCLES" | "CYCLE_PROCESSING" | "NOT_IN_QUEUE" | string;
    label: string;
    queuePosition: number | null;
    totalOpenParents: number;
    slotsAhead: number;
    openSlotsRemaining: number;
    slotsFilled: number;
    joinsNeededToCycle: number;
    joinsNeededToFirstChild: number;
    isNextInLine: boolean;
    nextSlotToFill: "Left" | "Right" | string | null;
    estimatedCycleReward: number;
    explanation: string;
  };
  currentSeat: Seat | null;
  seats: Array<{
    placementId: string;
    queueSequence: number;
    slot: string;
    status: string;
    openSlots: number;
    generation?: number;
    leftChildParticipationId?: string | null;
    rightChildParticipationId?: string | null;
    parentParticipationId?: string | null;
    parentUser?: UserBrief;
    isCurrentSeat?: boolean;
    filledAt?: string;
  }>;
  cycles: Array<{
    _id: string;
    cycleNumber: number;
    collectionAmount: number;
    walletAmount: number;
    samePoolAmount: number;
    nextPoolAmount: number;
    adminAmount: number;
    featureAmount: number;
    completedAt?: string;
  }>;
  ledgers: Array<{
    _id: string;
    type: string;
    amount: number;
    createdAt?: string;
    idempotencyKey?: string;
  }>;
  referral: {
    referrerSerialNumber: number;
    referrer?: {
      _id?: string;
      name?: string;
      serialNumber?: number;
    } | null;
    createdAt?: string;
  } | null;
  eligibility?: any;
  note?: string;
};

type Seat = {
  placementId: string;
  queueSequence: number;
  slot: "root" | "left" | "right" | string;
  status: string;
  openSlots: number;
  generation?: number;
  leftChildParticipationId?: string | null;
  rightChildParticipationId?: string | null;
  participationId: string;
  parentParticipationId?: string | null;
  user: UserBrief;
  parentUser?: UserBrief;
  cycleCount?: number | null;
  maxCycles?: number;
  isCurrentSeat?: boolean;
};

type MatrixData = {
  poolLevel: number;
  summary: {
    occupying: number;
    seatCount: number;
    openParents: number;
    openChildSlots: number;
    featureReserve: number;
    adminAllocation: number;
    nextFill: {
      placementId: string;
      queueSequence: number;
      openSlots: number;
      nextSlot: string;
      user: UserBrief;
      participationId: string;
    } | null;
  };
  seats: Seat[];
  fifoQueue: Array<{
    placementId: string;
    queueSequence: number;
    openSlots: number;
    nextSlot: string;
    user: UserBrief;
    participationId: string;
  }>;
  recentCycles: Array<{
    _id: string;
    cycleNumber: number;
    walletAmount: number;
    samePoolAmount: number;
    nextPoolAmount: number;
    adminAmount: number;
    featureAmount: number;
    collectionAmount: number;
    completedAt?: string;
    user: UserBrief;
    participationId: string;
  }>;
  howItWorks: string[];
};

type TreeNode = {
  seat: Seat;
  left: TreeNode | null;
  right: TreeNode | null;
};

function label(u: UserBrief) {
  if (!u) return "—";
  const sn = u.serialNumber != null ? `SN${u.serialNumber}` : "";
  return `${u.name || "User"} ${sn}`.trim();
}

function formatTimeAgo(dateStr?: string) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (isNaN(diffSec) || diffSec < 0) return "Just now";
  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function findChildSeat(
  seats: Seat[],
  parent: Seat,
  childPartId: string | null | undefined,
  side: "left" | "right"
): Seat | null {
  if (!childPartId) return null;
  const candidates = seats.filter(
    (s) =>
      String(s.participationId) === String(childPartId) &&
      String(s.parentParticipationId) === String(parent.participationId) &&
      s.slot === side &&
      s.queueSequence > parent.queueSequence
  );
  if (!candidates.length) {
    const loose = seats
      .filter(
        (s) =>
          String(s.participationId) === String(childPartId) &&
          String(s.parentParticipationId) === String(parent.participationId) &&
          s.queueSequence > parent.queueSequence
      )
      .sort((a, b) => a.queueSequence - b.queueSequence);
    return loose[0] || null;
  }
  return candidates.sort((a, b) => a.queueSequence - b.queueSequence)[0];
}

function buildTree(seats: Seat[], showHistory: boolean): TreeNode[] {
  const roots = seats
    .filter((s) => s.slot === "root")
    .sort((a, b) => a.queueSequence - b.queueSequence);

  const walk = (seat: Seat, depth: number): TreeNode | null => {
    if (depth > 40) return null;
    if (!showHistory && seat.status === "CYCLE_DONE" && !seat.isCurrentSeat) {
      // still show CYCLE_DONE if they have children in the structural tree from this seat
    }
    const leftSeat = findChildSeat(seats, seat, seat.leftChildParticipationId, "left");
    const rightSeat = findChildSeat(seats, seat, seat.rightChildParticipationId, "right");
    return {
      seat,
      left: leftSeat ? walk(leftSeat, depth + 1) : null,
      right: rightSeat ? walk(rightSeat, depth + 1) : null,
    };
  };

  return roots.map((r) => walk(r, 0)).filter(Boolean) as TreeNode[];
}

function SeatCard({
  seat,
  selected,
  isNextFill,
  onSelect,
  dimmed,
}: {
  seat: Seat;
  selected: boolean;
  isNextFill: boolean;
  onSelect: () => void;
  dimmed?: boolean;
}) {
  const done = seat.status === "CYCLE_DONE";
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "min-w-[148px] rounded-lg border px-3 py-2 text-left text-xs transition",
        selected ? "border-brand-500 ring-2 ring-brand-500/30" : "border-gray-200 dark:border-gray-700",
        isNextFill ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40" : "bg-white dark:bg-white/[0.04]",
        done ? "opacity-70" : "",
        dimmed ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="font-semibold text-gray-900 dark:text-white/90">{label(seat.user)}</div>
      <div className="mt-0.5 text-[11px] text-gray-500 capitalize">
        {seat.slot === "root" ? "Root" : `${seat.slot} slot`}
        {seat.isCurrentSeat ? " · current" : ""}
      </div>
      <div className="mt-1 flex flex-wrap gap-1">
        <span
          className={[
            "rounded px-1.5 py-0.5 text-[10px] font-medium",
            done ? "bg-gray-100 text-gray-600" : "bg-sky-50 text-sky-700",
          ].join(" ")}
        >
          {seat.status}
        </span>
        <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] text-amber-800">
          open {seat.openSlots}
        </span>
        {seat.cycleCount != null && (
          <span className="rounded bg-violet-50 px-1.5 py-0.5 text-[10px] text-violet-800">
            {seat.cycleCount}/{seat.maxCycles ?? 10}
          </span>
        )}
      </div>
      {isNextFill && (
        <div className="mt-1 text-[10px] font-semibold text-emerald-700">NEXT FILL</div>
      )}
    </button>
  );
}

function TreeBranch({
  node,
  selectedId,
  nextFillId,
  onSelect,
  showHistory,
}: {
  node: TreeNode;
  selectedId: string | null;
  nextFillId: string | null;
  onSelect: (seat: Seat) => void;
  showHistory: boolean;
}) {
  const hide =
    !showHistory &&
    node.seat.status === "CYCLE_DONE" &&
    !node.left &&
    !node.right &&
    !node.seat.isCurrentSeat;

  if (hide) return null;

  const showLeft =
    !!node.left ||
    (node.seat.status !== "CYCLE_DONE" && !node.seat.leftChildParticipationId);
  const showRight =
    !!node.right ||
    (node.seat.status !== "CYCLE_DONE" &&
      ((!node.seat.rightChildParticipationId &&
        !!node.seat.leftChildParticipationId) ||
        (!node.seat.leftChildParticipationId && node.seat.openSlots > 0)));

  return (
    <div className="flex flex-col items-center">
      <SeatCard
        seat={node.seat}
        selected={selectedId === String(node.seat.placementId)}
        isNextFill={nextFillId === String(node.seat.placementId)}
        onSelect={() => onSelect(node.seat)}
        dimmed={!showHistory && node.seat.status === "CYCLE_DONE" && !node.seat.isCurrentSeat}
      />
      {(node.left || node.right || showLeft || showRight) && (
        <>
          <div className="h-5 w-[3px] rounded-full bg-gray-800 dark:bg-gray-200" />
          <div className="flex">
            <div className="flex min-w-[160px] flex-col items-center">
              <div className="relative flex h-5 w-full justify-center">
                {(node.right || showRight) && (
                  <div className="absolute top-0 right-0 h-[3px] w-1/2 bg-gray-800 dark:bg-gray-200" />
                )}
                <div className="h-full w-[3px] rounded-full bg-gray-800 dark:bg-gray-200" />
              </div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                L
              </div>
              {node.left ? (
                <TreeBranch
                  node={node.left}
                  selectedId={selectedId}
                  nextFillId={nextFillId}
                  onSelect={onSelect}
                  showHistory={showHistory}
                />
              ) : (
                <div className="rounded border border-dashed border-gray-400 px-3 py-2 text-[10px] text-gray-400">
                  open
                </div>
              )}
            </div>
            <div className="flex min-w-[160px] flex-col items-center">
              <div className="relative flex h-5 w-full justify-center">
                {(node.left || showLeft) && (
                  <div className="absolute top-0 left-0 h-[3px] w-1/2 bg-gray-800 dark:bg-gray-200" />
                )}
                <div className="h-full w-[3px] rounded-full bg-gray-800 dark:bg-gray-200" />
              </div>
              <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                R
              </div>
              {node.right ? (
                <TreeBranch
                  node={node.right}
                  selectedId={selectedId}
                  nextFillId={nextFillId}
                  onSelect={onSelect}
                  showHistory={showHistory}
                />
              ) : (
                <div className="rounded border border-dashed border-gray-400 px-3 py-2 text-[10px] text-gray-400">
                  open
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AutopoolMatrix() {
  const searchParams = useSearchParams();
  const poolQuery = searchParams?.get("pool");
  const parsedPool = useMemo(() => {
    const num = Number(poolQuery);
    return num >= 1 && num <= 10 ? num : 1;
  }, [poolQuery]);

  const [poolLevel, setPoolLevel] = useState<number>(parsedPool);
  const [data, setData] = useState<MatrixData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [isQueueExpanded, setIsQueueExpanded] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [journey, setJourney] = useState<JourneyData | null>(null);
  const [journeyError, setJourneyError] = useState<string | null>(null);
  const [journeyLoading, setJourneyLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"seats" | "cycles" | "ledger">("seats");
  const [cyclesViewMode, setCyclesViewMode] = useState<"table" | "feed">("table");
  const [showCyclesHelp, setShowCyclesHelp] = useState(false);

  useEffect(() => {
    const num = Number(poolQuery);
    if (num >= 1 && num <= 10 && num !== poolLevel) {
      setPoolLevel(num);
    }
  }, [poolQuery, poolLevel]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await autopoolAdmin(`/matrix?poolLevel=${poolLevel}`);
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [poolLevel]);

  useEffect(() => {
    load();
  }, [load]);

  const trees = useMemo(() => {
    if (!data?.seats?.length) return [];
    return buildTree(data.seats, showHistory);
  }, [data, showHistory]);

  const nextFillId = data?.summary?.nextFill
    ? String(data.summary.nextFill.placementId)
    : null;

  const filteredHighlight = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q || !data?.seats) return null;
    const hit = data.seats.find((s) => {
      const name = (s.user?.name || "").toLowerCase();
      const sn = String(s.user?.serialNumber ?? "");
      return name.includes(q) || sn === q || sn.includes(q);
    });
    return hit ? String(hit.placementId) : null;
  }, [search, data]);

  const closeJourney = useCallback(() => {
    setSelectedSeat(null);
    setJourney(null);
    setJourneyError(null);
    setJourneyLoading(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && (selectedSeat || journeyLoading)) {
        closeJourney();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedSeat, journeyLoading, closeJourney]);

  const openJourney = async (seat: Seat) => {
    setSelectedSeat(seat);
    setJourney(null);
    setJourneyError(null);
    setJourneyLoading(true);
    setActiveTab("seats");
    try {
      const res = await autopoolAdmin(`/participations/${seat.participationId}/journey`);
      setJourney(res.data);
    } catch (e: any) {
      setJourneyError(e?.response?.data?.message || e.message);
    } finally {
      setJourneyLoading(false);
    }
  };

  const isJourneyOpen = Boolean(selectedSeat || journeyLoading);

  return (
    <div className="space-y-4 overflow-x-hidden">
      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Auto Pool Matrix</h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
              Live FIFO tree, next fill, cycles, and per-person journey. Referral SN ≠ matrix parent.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="text-sm text-gray-600">
              Pool{" "}
              <select
                className="ml-1 rounded border px-2 py-1.5 text-sm"
                value={poolLevel}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  setPoolLevel(next);
                  if (typeof window !== "undefined") {
                    const url = new URL(window.location.href);
                    url.searchParams.set("pool", String(next));
                    window.history.replaceState({}, "", url.toString());
                  }
                }}
              >
                {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
            <input
              className="rounded border px-3 py-1.5 text-sm"
              placeholder="Search SN or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <label className="flex items-center gap-1.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={showHistory}
                onChange={(e) => setShowHistory(e.target.checked)}
              />
              Full history
            </label>
            <button
              type="button"
              onClick={load}
              className="rounded-lg border px-3 py-1.5 text-sm"
              disabled={loading}
            >
              {loading ? "Loading…" : "Refresh"}
            </button>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {data && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Occupying" value={data.summary.occupying} />
            <Stat label="Seats" value={data.summary.seatCount} />
            <Stat
              label="Open child slots"
              value={`${data.summary.openChildSlots} (${data.summary.openParents} parents)`}
            />
            <Stat
              label="Reserves"
              value={`A ${data.summary.adminAllocation} · F ${data.summary.featureReserve}`}
            />
          </div>
        )}

        {data?.summary?.nextFill && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            <strong>Next joiner</strong> fills{" "}
            <strong>{label(data.summary.nextFill.user)}</strong> —{" "}
            <span className="capitalize">{data.summary.nextFill.nextSlot} slot</span> ({data.summary.nextFill.openSlots} open)
          </div>
        )}

        {data?.howItWorks && (
          <details className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-200">
              How placement works
            </summary>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {data.howItWorks.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <h3 className="shrink-0 border-b border-gray-100 px-4 py-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:border-gray-800">
              Live tree
            </h3>
            <div className="max-h-[min(70vh,720px)] overflow-auto">
              {!data?.seats?.length && !loading ? (
                <p className="p-4 text-sm text-gray-500">No seats in this pool yet.</p>
              ) : (
                <div className="inline-block min-w-full p-6">
                  <div className="flex w-max flex-col items-center gap-10">
                    {trees.map((t) => (
                      <TreeBranch
                        key={String(t.seat.placementId)}
                        node={t}
                        selectedId={
                          filteredHighlight ||
                          (selectedSeat ? String(selectedSeat.placementId) : null)
                        }
                        nextFillId={nextFillId}
                        onSelect={openJourney}
                        showHistory={showHistory}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <button
              type="button"
              onClick={() => setIsQueueExpanded((prev) => !prev)}
              className="flex w-full items-center justify-between p-4 text-left transition hover:bg-gray-50/50 dark:hover:bg-white/[0.01]"
            >
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                  Next in Line to Receive Members
                </h3>
                {data?.fifoQueue?.length ? (
                  <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                    {data.fifoQueue.length}
                  </span>
                ) : null}
              </div>
              <span className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                {isQueueExpanded ? "Collapse" : "Expand"}
                <svg
                  className={`h-4 w-4 transition-transform duration-200 ${
                    isQueueExpanded ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isQueueExpanded && (
              <div className="border-t border-gray-100 p-4 pt-3 dark:border-gray-800">
                {!data?.fifoQueue?.length ? (
                  <p className="text-sm text-gray-500">No open seats waiting to receive members.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {data.fifoQueue.map((q, i) => (
                      <button
                        key={String(q.placementId)}
                        type="button"
                        onClick={() => {
                          const seat = data.seats.find(
                            (s) => String(s.placementId) === String(q.placementId)
                          );
                          if (seat) openJourney(seat);
                        }}
                        className={[
                          "rounded-lg border px-3 py-2 text-left text-xs transition",
                          i === 0
                            ? "border-emerald-500 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40"
                            : "border-gray-200 bg-gray-50 hover:border-gray-300 dark:border-gray-700 dark:bg-white/[0.04]",
                        ].join(" ")}
                      >
                        <div className="font-semibold text-gray-900 dark:text-white">
                          #{i + 1} {label(q.user)}
                        </div>
                        <div className="mt-0.5 text-gray-500 dark:text-gray-400">
                          Next: <span className="capitalize">{q.nextSlot} slot</span> · {q.openSlots} open
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            {/* Header with Title, Count, Explainer and View Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3.5 dark:border-gray-800">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                    Recent Completed Cycles
                  </h3>
                  {data?.recentCycles?.length ? (
                    <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {data.recentCycles.length} completed
                    </span>
                  ) : null}
                </div>
                <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                  Triggered when both Left & Right slots fill under a member. Shows automated 5-way payout distributions & FIFO tree re-entries.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCyclesHelp((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                    showCyclesHelp
                      ? "border-brand-300 bg-brand-50 text-brand-700 dark:border-brand-800 dark:bg-brand-950/40 dark:text-brand-300"
                      : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  }`}
                >
                  <Info className="h-3.5 w-3.5" />
                  <span>{showCyclesHelp ? "Hide Guide" : "How Cycles Work"}</span>
                </button>

                <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 dark:border-gray-700 dark:bg-gray-800">
                  <button
                    type="button"
                    onClick={() => setCyclesViewMode("table")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      cyclesViewMode === "table"
                        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                    title="Audit Table View"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Table</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCyclesViewMode("feed")}
                    className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      cyclesViewMode === "feed"
                        ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white"
                        : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                    }`}
                    title="Event Feed Cards"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cards</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Optional Collapsible Educational Guide Banner */}
            {showCyclesHelp && (
              <div className="mt-3 rounded-xl border border-brand-100 bg-brand-50/40 p-3.5 text-xs dark:border-brand-900/40 dark:bg-brand-950/20">
                <div className="flex items-center gap-1.5 font-bold text-brand-900 dark:text-brand-200">
                  <Sparkles className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                  <span>Automated 5-Way Cycle Split & Progression Flow</span>
                </div>
                <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-emerald-200/60 bg-white/80 p-2.5 dark:border-emerald-900/40 dark:bg-gray-900/60">
                    <div className="font-bold text-emerald-700 dark:text-emerald-300">1. User Profit (20%)</div>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      Instantly credited to the member's DreamMart Shopping Wallet.
                    </p>
                  </div>
                  <div className="rounded-lg border border-blue-200/60 bg-white/80 p-2.5 dark:border-blue-900/40 dark:bg-gray-900/60">
                    <div className="font-bold text-blue-700 dark:text-blue-300">2. Auto Re-Entry (50%)</div>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      Re-places member as filler into oldest open FIFO slot (Cycles 1–9). On Cycle 10, goes to Feature.
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200/60 bg-white/80 p-2.5 dark:border-amber-900/40 dark:bg-gray-900/60">
                    <div className="font-bold text-amber-700 dark:text-amber-300">3. Next Pool (20%)</div>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      Reserves entry for Next Pool (Cycles 1–5). Milestone 5 unlocks upgrade! (Cycles 6–10 go to Feature).
                    </p>
                  </div>
                  <div className="rounded-lg border border-purple-200/60 bg-white/80 p-2.5 dark:border-purple-900/40 dark:bg-gray-900/60">
                    <div className="font-bold text-purple-700 dark:text-purple-300">4. System Reserves (10%)</div>
                    <p className="mt-1 text-[11px] text-gray-600 dark:text-gray-400">
                      5% Admin fee for platform maintenance + 5% Feature reserve for network liquidity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!data?.recentCycles?.length ? (
              <div className="py-8 text-center text-sm text-gray-500">
                <Clock className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600" />
                <p className="mt-2 font-medium">No completed cycles in Pool {poolLevel} yet.</p>
                <p className="text-xs text-gray-400">
                  When members receive joiners in both Left and Right slots, their completed cycles and payouts will appear here in real-time.
                </p>
              </div>
            ) : cyclesViewMode === "table" ? (
              /* High-Density Audit Table */
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:border-gray-800">
                      <th className="p-2.5">Member</th>
                      <th className="p-2.5">Cycle Progress</th>
                      <th className="p-2.5">User Profit (20%)</th>
                      <th className="p-2.5">Auto Re-entry (50%)</th>
                      <th className="p-2.5">Next Pool (20%)</th>
                      <th className="p-2.5">System (10%)</th>
                      <th className="p-2.5">Milestone & Outcome</th>
                      <th className="p-2.5">Completed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {data.recentCycles.map((c) => {
                      const seat = data.seats.find(
                        (s) => String(s.participationId) === String(c.participationId)
                      );
                      const isMilestone5 = c.cycleNumber === 5;
                      const isFinal10 = c.cycleNumber >= 10;

                      const seatToOpen: Seat = seat || {
                        placementId: String(c.participationId),
                        queueSequence: 0,
                        slot: "root",
                        status: "CYCLE_DONE",
                        openSlots: 0,
                        participationId: String(c.participationId),
                        user: c.user,
                      };

                      return (
                        <tr
                          key={c._id}
                          onClick={() => openJourney(seatToOpen)}
                          className="group cursor-pointer transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-950/20"
                          title="Click to inspect this member's Person Journey"
                        >
                          <td className="p-2.5 font-medium text-brand-600 group-hover:text-brand-700 dark:text-brand-400">
                            <div className="flex items-center gap-1.5">
                              <span>{label(c.user)}</span>
                              <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                            </div>
                            <div className="text-[10px] font-normal text-gray-400">
                              Click to inspect journey
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="flex items-center gap-1.5 font-semibold text-gray-900 dark:text-white">
                              <span>Cycle #{c.cycleNumber}</span>
                              <span className="text-xs font-normal text-gray-400">/ 10</span>
                            </div>
                            <div className="mt-0.5 h-1 w-16 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                              <div
                                className={`h-full ${
                                  isFinal10
                                    ? "bg-purple-500"
                                    : isMilestone5
                                    ? "bg-amber-500"
                                    : "bg-emerald-500"
                                }`}
                                style={{
                                  width: `${Math.min(100, Math.round((c.cycleNumber / 10) * 100))}%`,
                                }}
                              />
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-bold text-emerald-600 dark:text-emerald-400">
                              +{c.walletAmount}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              DreamMart Wallet
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {c.samePoolAmount}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {isFinal10 ? "Redirected to Feature" : "Re-placed in Tree"}
                            </div>
                          </td>
                          <td className="p-2.5">
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              {c.nextPoolAmount}
                            </div>
                            <div className="text-[10px] text-gray-400">
                              {isMilestone5
                                ? `Pool ${poolLevel + 1} Unlocked`
                                : c.cycleNumber < 5
                                ? `Reserving for Pool ${poolLevel + 1}`
                                : "Redirected to Feature"}
                            </div>
                          </td>
                          <td className="p-2.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {c.adminAmount + c.featureAmount}
                            </span>
                            <div className="text-[10px] text-gray-400">
                              A: {c.adminAmount} · F: {c.featureAmount}
                            </div>
                          </td>
                          <td className="p-2.5">
                            {isMilestone5 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                                <Award className="h-3 w-3" />
                                Pool {poolLevel + 1} Unlocked
                              </span>
                            ) : isFinal10 ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                                <CheckCircle2 className="h-3 w-3" />
                                10/10 Completed
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                                <Repeat className="h-3 w-3" />
                                Re-entered FIFO Tree
                              </span>
                            )}
                          </td>
                          <td className="p-2.5 text-xs text-gray-500">
                            <span
                              title={
                                c.completedAt
                                  ? new Date(c.completedAt).toLocaleString()
                                  : undefined
                              }
                            >
                              {formatTimeAgo(c.completedAt)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Event Feed Cards */
              <div className="mt-3 grid gap-3 sm:grid-cols-1 lg:grid-cols-2">
                {data.recentCycles.map((c) => {
                  const seat = data.seats.find(
                    (s) => String(s.participationId) === String(c.participationId)
                  );
                  const isMilestone5 = c.cycleNumber === 5;
                  const isFinal10 = c.cycleNumber >= 10;

                  const seatToOpen: Seat = seat || {
                    placementId: String(c.participationId),
                    queueSequence: 0,
                    slot: "root",
                    status: "CYCLE_DONE",
                    openSlots: 0,
                    participationId: String(c.participationId),
                    user: c.user,
                  };

                  return (
                    <div
                      key={c._id}
                      onClick={() => openJourney(seatToOpen)}
                      className="group cursor-pointer rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition-all hover:border-brand-200 hover:bg-white hover:shadow-md dark:border-gray-800 dark:bg-white/[0.02] dark:hover:border-brand-800 dark:hover:bg-white/[0.04]"
                    >
                      {/* Top Card Row: Member Info, Cycle # & Outcome */}
                      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-2.5 dark:border-gray-800/80">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 group-hover:text-brand-600 dark:text-white dark:group-hover:text-brand-400">
                              {label(c.user)}
                            </span>
                            <span className="rounded bg-brand-50 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                              Cycle {c.cycleNumber} of 10
                            </span>
                          </div>
                          <div className="mt-0.5 text-[11px] text-gray-500">
                            Left & Right tree slots filled
                          </div>
                        </div>

                        <div className="text-right">
                          {isMilestone5 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                              <Award className="h-3 w-3" />
                              Pool {poolLevel + 1} Unlocked
                            </span>
                          ) : isFinal10 ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-800 dark:bg-purple-950/60 dark:text-purple-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Final Cycle
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                              <Repeat className="h-3 w-3" />
                              Tree Re-entry
                            </span>
                          )}
                          <div
                            className="mt-1 text-[10px] text-gray-400"
                            title={
                              c.completedAt
                                ? new Date(c.completedAt).toLocaleString()
                                : undefined
                            }
                          >
                            {formatTimeAgo(c.completedAt)}
                          </div>
                        </div>
                      </div>

                      {/* 4-way Split Grid */}
                      <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                          <div className="text-[10px] font-medium uppercase text-emerald-700 dark:text-emerald-300">
                            User Profit
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                            +{c.walletAmount}
                          </div>
                          <div className="text-[9px] text-emerald-600/80 dark:text-emerald-400/70">
                            DreamMart
                          </div>
                        </div>

                        <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-2 dark:border-blue-900/40 dark:bg-blue-950/20">
                          <div className="text-[10px] font-medium uppercase text-blue-700 dark:text-blue-300">
                            Re-Entry (50%)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-blue-700 dark:text-blue-300">
                            {c.samePoolAmount}
                          </div>
                          <div className="text-[9px] text-blue-600/80 dark:text-blue-400/70">
                            {isFinal10 ? "To Feature" : "Next Seat"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-2 dark:border-amber-900/40 dark:bg-amber-950/20">
                          <div className="text-[10px] font-medium uppercase text-amber-700 dark:text-amber-300">
                            Next Pool (20%)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-amber-700 dark:text-amber-300">
                            {c.nextPoolAmount}
                          </div>
                          <div className="text-[9px] text-amber-600/80 dark:text-amber-400/70">
                            {c.cycleNumber <= 5 ? "Reserve" : "To Feature"}
                          </div>
                        </div>

                        <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-2 dark:border-purple-900/40 dark:bg-purple-950/20">
                          <div className="text-[10px] font-medium uppercase text-purple-700 dark:text-purple-300">
                            System (10%)
                          </div>
                          <div className="mt-0.5 text-sm font-bold text-purple-700 dark:text-purple-300">
                            {c.adminAmount + c.featureAmount}
                          </div>
                          <div className="text-[9px] text-purple-600/80 dark:text-purple-400/70">
                            A:{c.adminAmount} · F:{c.featureAmount}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Explanatory Narrative */}
                      <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-2 text-[11px] text-gray-500 dark:border-gray-800">
                        <span className="truncate pr-2">
                          {isMilestone5
                            ? `Earned eligibility to upgrade to Pool ${poolLevel + 1}!`
                            : isFinal10
                            ? "All 10 cycle rounds completed for this participation."
                            : `Re-entered FIFO queue to earn again in Cycle ${c.cycleNumber + 1}.`}
                        </span>
                        <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-brand-600 dark:text-brand-400">
                          Inspect Journey
                          <ArrowUpRight className="h-3 w-3" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* Slide-over Person Journey Drawer (Opens smoothly when member clicked) */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          isJourneyOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!isJourneyOpen}
      >
        {/* Subtle Backdrop */}
        <div
          className="absolute inset-0 bg-black/35 backdrop-blur-[2px] transition-opacity duration-300 dark:bg-black/60"
          onClick={closeJourney}
        />

        {/* Sliding Panel */}
        <div
          className={`absolute inset-y-0 right-0 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl transition-transform duration-300 ease-out dark:bg-gray-900 ${
            isJourneyOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Header */}
          <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-gray-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-800 dark:text-gray-200">
                  Person Journey
                </h3>
                <span className="inline-flex items-center rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-950/60 dark:text-brand-300">
                  Live Audit
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">
                {selectedSeat?.user
                  ? `Inspecting ${label(selectedSeat.user)}`
                  : "Member matrix position & wallets"}
              </p>
            </div>
            <button
              onClick={closeJourney}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              title="Close inspection"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {journeyLoading && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-xl border border-brand-200/80 bg-brand-50/50 p-4 dark:border-brand-900/40 dark:bg-brand-950/20">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-600 border-t-transparent dark:border-brand-400" />
                  <div>
                    <div className="text-xs font-semibold text-brand-900 dark:text-brand-200">
                      Loading live member journey…
                    </div>
                    <p className="text-[11px] text-brand-700/80 dark:text-brand-300/80">
                      Fetching live wallets, queue position, and cycle payout history.
                    </p>
                  </div>
                </div>

                <div className="h-28 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
                  <div className="h-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/[0.04]" />
                </div>
              </div>
            )}

            {journeyError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                <div className="font-semibold">Unable to load person journey</div>
                <p className="mt-1">{journeyError}</p>
                <button
                  onClick={() => selectedSeat && openJourney(selectedSeat)}
                  className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            )}

            {journey && !journeyLoading && (
              <div className="space-y-4 text-sm">
                {/* 1. Member Profile & Status Bar */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800 dark:bg-white/[0.02]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900 dark:text-white">
                          {label(journey.participation?.user)}
                        </span>
                        {journey.participation?.user?.serialNumber != null && (
                          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[11px] font-bold text-brand-800 dark:bg-brand-900/60 dark:text-brand-300">
                            #SN{journey.participation.user.serialNumber}
                          </span>
                        )}
                      </div>
                      {journey.participation?.user?.email && (
                        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {journey.participation.user.email}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                        journey.participation?.status === "COMPLETED"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                          : journey.participation?.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                      }`}
                    >
                      {journey.participation?.status}
                    </span>
                  </div>

                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="rounded-md bg-white px-2 py-1 font-medium text-gray-700 shadow-2xs dark:bg-white/[0.05] dark:text-gray-300">
                      Pool {journey.participation?.poolLevel}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 font-medium capitalize text-gray-700 shadow-2xs dark:bg-white/[0.05] dark:text-gray-300">
                      {journey.participation?.entryType} entry
                    </span>
                    {journey.participation?.isBootstrap && (
                      <span className="rounded-md bg-purple-50 px-2 py-1 font-medium text-purple-700 dark:bg-purple-950/40 dark:text-purple-300">
                        Bootstrap Root
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. Hero Card: Waiting Queue & Next Cycle Completion */}
                <div
                  className={`overflow-hidden rounded-xl border p-4 transition-all ${
                    journey.waitingInfo?.status === "IN_QUEUE"
                      ? journey.waitingInfo.isNextInLine
                        ? "border-emerald-300 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:border-emerald-700/60 dark:from-emerald-950/30"
                        : "border-sky-300 bg-gradient-to-br from-sky-500/10 via-sky-500/5 to-transparent dark:border-sky-700/60 dark:from-sky-950/30"
                      : journey.waitingInfo?.status === "COMPLETED_ALL_CYCLES"
                      ? "border-blue-200 bg-blue-50/60 dark:border-blue-800/60 dark:bg-blue-950/20"
                      : "border-gray-200 bg-gray-50/70 dark:border-gray-800 dark:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-brand-600 dark:text-brand-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        Queue & Next Cycle Status
                      </span>
                    </div>
                    {journey.waitingInfo?.status === "IN_QUEUE" && (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          journey.waitingInfo.isNextInLine
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300"
                        }`}
                      >
                        {journey.waitingInfo.isNextInLine
                          ? "🟢 Next in Line to Receive"
                          : `Waiting Queue #${journey.waitingInfo.queuePosition} of ${journey.waitingInfo.totalOpenParents}`}
                      </span>
                    )}
                  </div>

                  {journey.waitingInfo?.status === "IN_QUEUE" ? (
                    <div className="mt-3 space-y-3">
                      {/* Big Callout: Joins needed to cycle */}
                      <div className="rounded-lg bg-white/80 p-3 shadow-2xs backdrop-blur-xs dark:bg-gray-900/60">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
                          Next Cycle Completion
                        </div>
                        <div className="mt-1 flex items-baseline gap-2">
                          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
                            {journey.waitingInfo.joinsNeededToCycle}
                          </span>
                          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            more member{journey.waitingInfo.joinsNeededToCycle === 1 ? "" : "s"} needed to complete Cycle{" "}
                            {(journey.participation?.cycleCount ?? 0) + 1}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          Reward on completion:{" "}
                          <strong className="text-emerald-600 dark:text-emerald-400">
                            +{journey.waitingInfo.estimatedCycleReward || 200}
                          </strong>{" "}
                          credited directly to DreamMart wallet.
                        </p>
                      </div>

                      {/* Visual 2-Slot Node Progress */}
                      <div>
                        <div className="mb-1.5 flex items-center justify-between text-xs font-medium text-gray-600 dark:text-gray-400">
                          <span>Current Seat Slots (2-Slot Binary Node):</span>
                          <span>
                            {journey.waitingInfo.slotsFilled}/2 filled
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div
                            className={`rounded-lg border p-2.5 text-center ${
                              journey.waitingInfo.slotsFilled >= 1
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                              Left Slot
                            </div>
                            <div className="mt-1 font-semibold">
                              {journey.waitingInfo.slotsFilled >= 1
                                ? "✓ Filled"
                                : journey.waitingInfo.nextSlotToFill === "Left"
                                ? "⏳ Open (Fills Next)"
                                : "⏳ Open"}
                            </div>
                          </div>

                          <div
                            className={`rounded-lg border p-2.5 text-center ${
                              journey.waitingInfo.slotsFilled >= 2
                                ? "border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : journey.waitingInfo.nextSlotToFill === "Right"
                                ? "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                                : "border-gray-200 bg-gray-50 text-gray-500 dark:border-gray-800 dark:bg-white/[0.02]"
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase tracking-wider">
                              Right Slot
                            </div>
                            <div className="mt-1 font-semibold">
                              {journey.waitingInfo.slotsFilled >= 2
                                ? "✓ Filled"
                                : journey.waitingInfo.nextSlotToFill === "Right"
                                ? "⏳ Open (Fills Next)"
                                : "⏳ Open (After Left)"}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Breakdown list */}
                      <div className="rounded-lg bg-white/60 p-2.5 text-xs text-gray-600 dark:bg-white/[0.02] dark:text-gray-400">
                        <div className="flex justify-between py-0.5">
                          <span>Slots ahead in queue:</span>
                          <strong className="text-gray-900 dark:text-white">
                            {journey.waitingInfo.slotsAhead} slot{journey.waitingInfo.slotsAhead === 1 ? "" : "s"}
                          </strong>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span>Open slots on this seat:</span>
                          <strong className="text-gray-900 dark:text-white">
                            {journey.waitingInfo.openSlotsRemaining} open
                          </strong>
                        </div>
                        <div className="flex justify-between py-0.5">
                          <span>Next slot receiving member:</span>
                          <strong className="text-brand-600 dark:text-brand-400">
                            {journey.waitingInfo.nextSlotToFill} slot
                          </strong>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {journey.waitingInfo.explanation}
                      </p>
                    </div>
                  ) : journey.waitingInfo?.status === "COMPLETED_ALL_CYCLES" ? (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-semibold text-blue-700 dark:text-blue-300">
                        🎉 Completed All {journey.participation?.maxCycles} Cycles
                      </p>
                      <p className="mt-1">{journey.waitingInfo.explanation}</p>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-gray-600 dark:text-gray-300">
                      <p className="font-semibold">{journey.waitingInfo?.label}</p>
                      <p className="mt-1">{journey.waitingInfo?.explanation}</p>
                    </div>
                  )}
                </div>

                {/* 3. Live Wallets & Earnings (2x2 Grid) */}
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    User Wallets & Autopool Earnings
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* DreamMart Wallet */}
                    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-3 dark:border-brand-900/40 dark:bg-brand-950/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-brand-900 dark:text-brand-200">
                        <Wallet className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
                        <span>DreamMart Wallet</span>
                      </div>
                      <div className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white">
                        {(journey.wallets?.eCartWallet ?? 0).toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        Autopool payouts credit here
                      </div>
                    </div>

                    {/* Fun & Enjoy Wallet */}
                    <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-3 dark:border-purple-900/40 dark:bg-purple-950/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-900 dark:text-purple-200">
                        <Coins className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Fun & Enjoy Wallet</span>
                      </div>
                      <div className="mt-1.5 text-lg font-bold text-gray-900 dark:text-white">
                        {(journey.wallets?.shortVideoWallet ?? 0).toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        Reels & watch rewards
                      </div>
                    </div>

                    {/* Pool Earnings */}
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-200">
                        <TrendingUp className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Pool {journey.participation?.poolLevel} Earned</span>
                      </div>
                      <div className="mt-1.5 text-lg font-bold text-emerald-700 dark:text-emerald-300">
                        {(journey.earnings?.poolEarnings ?? 0).toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        {journey.earnings?.poolCycleCount ?? journey.participation?.cycleCount ?? 0} cycle(s) in this pool
                      </div>
                    </div>

                    {/* Total All-Pool Earnings */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 dark:text-amber-200">
                        <Sparkles className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Total Autopool Earned</span>
                      </div>
                      <div className="mt-1.5 text-lg font-bold text-amber-700 dark:text-amber-300">
                        {(journey.earnings?.totalEarnings ?? 0).toLocaleString("en-IN")}
                      </div>
                      <div className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        {journey.earnings?.totalCycleCount ?? 0} cycle(s) across all pools
                      </div>
                    </div>
                  </div>

                  {/* Cycle Progression & Reserve */}
                  <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        Cycle Progress:{" "}
                        <strong>
                          {journey.participation?.cycleCount ?? 0} of {journey.participation?.maxCycles ?? 10}
                        </strong>
                      </span>
                      <span className="font-semibold text-brand-600 dark:text-brand-400">
                        {Math.round(
                          ((journey.participation?.cycleCount ?? 0) /
                            (journey.participation?.maxCycles || 10)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-300"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.round(
                              ((journey.participation?.cycleCount ?? 0) /
                                (journey.participation?.maxCycles || 10)) *
                                100
                            )
                          )}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                      <span>Next-pool upgrade reserve:</span>
                      <strong className="text-gray-900 dark:text-white">
                        {journey.participation?.nextPoolEligibleAmount ?? 0}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* 4. Referral Inviter vs Matrix Parent (FIFO) */}
                <div>
                  <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Referral vs Placement (Segregation)
                  </h4>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {/* Joined Via Referral */}
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 dark:border-blue-900/30 dark:bg-blue-950/20">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                        1. Joined Via Referral
                      </div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                        {journey.referral ? (
                          <>
                            {journey.referral.referrer?.name || "Member"}{" "}
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              #SN{journey.referral.referrerSerialNumber}
                            </span>
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">System Bootstrap / Genesis</span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        Whose referral code was used at registration
                      </p>
                    </div>

                    {/* Current Matrix Parent */}
                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 dark:border-amber-900/30 dark:bg-amber-950/20">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                        2. Matrix Placement (FIFO)
                      </div>
                      <div className="mt-1 font-semibold text-gray-900 dark:text-white">
                        {journey.currentSeat?.parentUser ? (
                          <>
                            {journey.currentSeat.parentUser.name}{" "}
                            <span className="text-xs text-amber-600 dark:text-amber-400">
                              #SN{journey.currentSeat.parentUser.serialNumber}
                            </span>
                            <span className="ml-1 text-xs font-normal text-gray-500">
                              ({journey.currentSeat.slot === "root" ? "Root" : `${journey.currentSeat.slot} slot`})
                            </span>
                          </>
                        ) : (
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            Root Node (No Matrix Parent)
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                        Who they sit under in the binary tree (FIFO)
                      </p>
                    </div>
                  </div>
                </div>

                {/* 5. Tabbed Detailed Breakdown (Placements / Cycles / Ledger) */}
                <div className="pt-1">
                  <div className="flex border-b border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setActiveTab("seats")}
                      className={`flex-1 border-b-2 py-2 text-center text-xs font-semibold transition-colors ${
                        activeTab === "seats"
                          ? "border-brand-500 text-brand-600 dark:text-brand-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Placements ({journey.seats?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("cycles")}
                      className={`flex-1 border-b-2 py-2 text-center text-xs font-semibold transition-colors ${
                        activeTab === "cycles"
                          ? "border-brand-500 text-brand-600 dark:text-brand-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Cycles ({journey.cycles?.length || 0})
                    </button>
                    <button
                      onClick={() => setActiveTab("ledger")}
                      className={`flex-1 border-b-2 py-2 text-center text-xs font-semibold transition-colors ${
                        activeTab === "ledger"
                          ? "border-brand-500 text-brand-600 dark:text-brand-400"
                          : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                      }`}
                    >
                      Ledger ({journey.ledgers?.length || 0})
                    </button>
                  </div>

                  <div className="mt-3">
                    {/* TAB 1: Placements */}
                    {activeTab === "seats" && (
                      <div className="space-y-2">
                        {(journey.seats || []).map((s: any, idx: number) => (
                          <div
                            key={s.placementId || idx}
                            className={`rounded-lg border p-2.5 text-xs transition-colors ${
                              s.isCurrentSeat
                                ? "border-brand-500/70 bg-brand-50/30 dark:border-brand-500/50 dark:bg-brand-950/20"
                                : "border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.01]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {s.slot === "root" ? "Root Seat" : `${s.slot.toUpperCase()} Slot`}
                              </span>
                              <div className="flex items-center gap-1.5">
                                {s.isCurrentSeat && (
                                  <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                                    CURRENT
                                  </span>
                                )}
                                <span
                                  className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                    s.status === "CYCLE_DONE"
                                      ? "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                                      : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                  }`}
                                >
                                  {s.status}
                                </span>
                              </div>
                            </div>
                            <div className="mt-1 text-gray-600 dark:text-gray-400">
                              {s.parentUser ? (
                                <>
                                  Sits under:{" "}
                                  <strong className="text-gray-800 dark:text-gray-200">
                                    {s.parentUser.name} (#SN{s.parentUser.serialNumber})
                                  </strong>
                                </>
                              ) : (
                                "Sits as: Root node"
                              )}
                            </div>
                            <div className="mt-0.5 flex justify-between text-[11px] text-gray-500">
                              <span>Open child slots: {s.openSlots}</span>
                              {s.filledAt && (
                                <span>Filled: {new Date(s.filledAt).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* TAB 2: Cycles */}
                    {activeTab === "cycles" && (
                      <div>
                        {!journey.cycles?.length ? (
                          <p className="py-4 text-center text-xs text-gray-500">
                            No completed cycles yet for this participation.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {journey.cycles.map((c: any) => (
                              <div
                                key={c._id}
                                className="rounded-lg border border-gray-100 bg-white p-2.5 text-xs dark:border-gray-800 dark:bg-white/[0.01]"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-gray-900 dark:text-white">
                                    Cycle #{c.cycleNumber}
                                  </span>
                                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                    +{c.walletAmount} to Wallet
                                  </span>
                                </div>
                                <div className="mt-1.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-600 dark:text-gray-400">
                                  <div>Same-pool re-entry: {c.samePoolAmount}</div>
                                  <div>Next-pool reserve: {c.nextPoolAmount}</div>
                                  <div>Admin share: {c.adminAmount}</div>
                                  <div>Feature share: {c.featureAmount}</div>
                                </div>
                                {c.completedAt && (
                                  <div className="mt-1.5 border-t border-gray-100 pt-1 text-[10px] text-gray-400 dark:border-gray-800">
                                    Completed: {new Date(c.completedAt).toLocaleString()}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: Ledger */}
                    {activeTab === "ledger" && (
                      <div>
                        {!journey.ledgers?.length ? (
                          <p className="py-4 text-center text-xs text-gray-500">
                            No ledger records found.
                          </p>
                        ) : (
                          <div className="max-h-60 space-y-1.5 overflow-y-auto pr-1 text-xs">
                            {journey.ledgers.map((l: any, idx: number) => (
                              <div
                                key={l._id || l.idempotencyKey || idx}
                                className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2 dark:border-gray-800 dark:bg-white/[0.01]"
                              >
                                <div>
                                  <span className="font-medium text-gray-800 dark:text-gray-200">
                                    {l.type}
                                  </span>
                                  {l.createdAt && (
                                    <div className="text-[10px] text-gray-400">
                                      {new Date(l.createdAt).toLocaleTimeString([], {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  )}
                                </div>
                                <span className="font-semibold text-gray-900 dark:text-white">
                                  {l.amount}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-white/[0.02]">
      <div className="text-[11px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold">{value}</div>
    </div>
  );
}
