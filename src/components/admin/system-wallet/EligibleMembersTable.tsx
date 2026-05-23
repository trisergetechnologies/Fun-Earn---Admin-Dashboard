"use client";

import { ChevronRight } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { EligibleMember, EligibleMeta } from "./types/wallet";
import { WALLET_TABLE } from "./walletTableStyles";

function rewardsSummary(m: EligibleMember) {
  if (!m.topAchievementTitle) return "—";
  const extra = m.achievementCount > 1 ? ` (+${m.achievementCount - 1} more)` : "";
  return `L${m.highestLevel} · ${m.topAchievementTitle}${extra}`;
}

type Props = {
  users: EligibleMember[];
  meta: EligibleMeta | null;
  loading: boolean;
  onSelect: (m: EligibleMember) => void;
};

export default function EligibleMembersTable({ users, meta, loading, onSelect }: Props) {
  if (loading) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>
          Loading eligible members… first load may take a moment.
        </p>
      </div>
    );
  }
  if (!users.length) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>No payout-eligible members for this pool.</p>
      </div>
    );
  }

  const rulesOn = meta?.eligibilityRulesActive;

  return (
    <>
      <div className={`hidden md:block ${WALLET_TABLE.shell}`}>
        <div className={WALLET_TABLE.scroll}>
          <Table className="min-w-[960px]">
            <TableHeader className={WALLET_TABLE.header}>
              <TableRow>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Member
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Referral
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Package
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Rewards
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  New buyers
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Status
                </TableCell>
                <TableCell isHeader className={`${WALLET_TABLE.headerCell} w-12`}>
                  <span className="sr-only">Details</span>
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className={WALLET_TABLE.body}>
              {users.map((m) => (
                <TableRow
                  key={m.userId}
                  className={`cursor-pointer ${WALLET_TABLE.rowHover}`}
                  onClick={() => onSelect(m)}
                >
                  <TableCell className={WALLET_TABLE.cell}>
                    <div className="font-semibold text-gray-900 dark:text-white">{m.name}</div>
                    <div className={WALLET_TABLE.cellMuted}>#{m.serialNumber ?? "—"}</div>
                  </TableCell>
                  <TableCell className={`${WALLET_TABLE.cell} font-mono text-xs`}>
                    {m.referralCode}
                  </TableCell>
                  <TableCell className={WALLET_TABLE.cell}>{m.packageName || "—"}</TableCell>
                  <TableCell className={`${WALLET_TABLE.cell} max-w-[240px]`} title={rewardsSummary(m)}>
                    <span className="line-clamp-2">{rewardsSummary(m)}</span>
                  </TableCell>
                  <TableCell className={WALLET_TABLE.cell}>
                    <span className="text-base font-semibold tabular-nums text-gray-900 dark:text-white">
                      {m.newBuyersSinceLastPayout}
                    </span>
                    <div className={WALLET_TABLE.cellMuted}>since last payout</div>
                  </TableCell>
                  <TableCell className={WALLET_TABLE.cell}>
                    <Badge size="sm" color="success">
                      Ready
                    </Badge>
                    {rulesOn && m.minNewBuyersRequired != null ? (
                      <div className={`${WALLET_TABLE.cellMuted} mt-1.5`}>
                        gate ≤ {m.minNewBuyersRequired}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell className={`${WALLET_TABLE.cell} text-right`}>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-400" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {users.map((m) => (
          <button
            key={m.userId}
            type="button"
            onClick={() => onSelect(m)}
            className={`${WALLET_TABLE.mobileCard} w-full text-left transition hover:border-indigo-300 dark:hover:border-indigo-700`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{m.name}</p>
                <p className={`${WALLET_TABLE.cellMuted} mt-0.5`}>
                  #{m.serialNumber ?? "—"} · {m.referralCode}
                </p>
              </div>
              <Badge size="sm" color="success">
                Ready
              </Badge>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300">{rewardsSummary(m)}</p>
            <p className={WALLET_TABLE.cellMuted}>
              {m.newBuyersSinceLastPayout} new buyers · {m.packageName || "No package"}
            </p>
          </button>
        ))}
      </div>
    </>
  );
}
