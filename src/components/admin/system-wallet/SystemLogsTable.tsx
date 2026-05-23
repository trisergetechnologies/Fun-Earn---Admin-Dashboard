"use client";

import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import type { SystemLog } from "./types/wallet";
import { SOURCE_LABELS } from "./types/wallet";
import { WALLET_TABLE } from "./walletTableStyles";

function formatFromUser(log: SystemLog) {
  if (!log.fromUser) return "—";
  const { serialNumber, name } = log.fromUser;
  if (serialNumber != null) return `#${serialNumber} · ${name || "—"}`;
  return name || "—";
}

function truncate(s: string, n: number) {
  if (!s || s.length <= n) return s || "—";
  return `${s.slice(0, n)}…`;
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }),
    time: d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

type Props = {
  logs: SystemLog[];
  loading: boolean;
};

export default function SystemLogsTable({ logs, loading }: Props) {
  if (loading) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>Loading transaction logs…</p>
      </div>
    );
  }
  if (!logs.length) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>No logs match your filters.</p>
      </div>
    );
  }

  return (
    <>
      <div className={`hidden md:block ${WALLET_TABLE.shell}`}>
        <div className={WALLET_TABLE.scroll}>
          <Table className="min-w-[900px]">
            <TableHeader className={WALLET_TABLE.header}>
              <TableRow>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Date & time
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Type
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Amount
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Source
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  From user
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Context
                </TableCell>
                <TableCell isHeader className={WALLET_TABLE.headerCell}>
                  Status
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className={WALLET_TABLE.body}>
              {logs.map((log) => {
                const { date, time } = formatDate(log.createdAt);
                return (
                  <TableRow key={log._id} className={WALLET_TABLE.rowHover}>
                    <TableCell className={WALLET_TABLE.cell}>
                      <div className="font-medium text-gray-900 dark:text-white">{date}</div>
                      <div className={WALLET_TABLE.cellMuted}>{time}</div>
                    </TableCell>
                    <TableCell className={WALLET_TABLE.cell}>
                      <Badge size="sm" color={log.type === "inflow" ? "success" : "warning"}>
                        {log.type === "inflow" ? "Inflow" : "Outflow"}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`${WALLET_TABLE.cell} font-semibold tabular-nums ${
                        log.type === "inflow" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                      }`}
                    >
                      {log.type === "inflow" ? "+" : "−"}₹{log.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className={WALLET_TABLE.cell}>
                      {SOURCE_LABELS[log.source] || log.source}
                    </TableCell>
                    <TableCell className={WALLET_TABLE.cell}>{formatFromUser(log)}</TableCell>
                    <TableCell
                      className={`${WALLET_TABLE.cell} max-w-[220px]`}
                      title={log.context}
                    >
                      <span className="line-clamp-2 text-gray-600 dark:text-gray-400">
                        {truncate(log.context, 80)}
                      </span>
                    </TableCell>
                    <TableCell className={WALLET_TABLE.cell}>
                      <Badge size="sm" color={log.status === "success" ? "success" : "error"}>
                        {log.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {logs.map((log) => {
          const { date, time } = formatDate(log.createdAt);
          return (
            <article key={log._id} className={WALLET_TABLE.mobileCard}>
              <div className="flex items-start justify-between gap-3">
                <Badge size="sm" color={log.type === "inflow" ? "success" : "warning"}>
                  {log.type === "inflow" ? "Inflow" : "Outflow"}
                </Badge>
                <span
                  className={`text-lg font-bold tabular-nums ${
                    log.type === "inflow"
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {log.type === "inflow" ? "+" : "−"}₹{log.amount.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {date} · {time}
              </p>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-2 text-sm">
                <dt className="text-gray-500">Source</dt>
                <dd className="text-gray-800 dark:text-gray-200">
                  {SOURCE_LABELS[log.source] || log.source}
                </dd>
                <dt className="text-gray-500">From</dt>
                <dd className="text-gray-800 dark:text-gray-200">{formatFromUser(log)}</dd>
                <dt className="text-gray-500">Context</dt>
                <dd className="text-gray-600 dark:text-gray-400">{log.context || "—"}</dd>
              </dl>
              <Badge size="sm" color={log.status === "success" ? "success" : "error"}>
                {log.status}
              </Badge>
            </article>
          );
        })}
      </div>
    </>
  );
}
