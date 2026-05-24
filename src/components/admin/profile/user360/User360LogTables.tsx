"use client";

import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WALLET_TABLE } from "@/components/admin/system-wallet/walletTableStyles";
import Image from "next/image";
import { Video } from "lucide-react";
import type { User360LogType } from "./types";
import { fmt, formatDate } from "./format";

type Props = {
  logType: User360LogType;
  items: unknown[];
  loading: boolean;
};

export default function User360LogTables({ logType, items, loading }: Props) {
  if (loading) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>Loading records…</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className={WALLET_TABLE.shell}>
        <p className={WALLET_TABLE.empty}>No records for this section.</p>
      </div>
    );
  }

  if (logType === "coupons") {
    return (
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {(items as Record<string, unknown>[]).map((c) => (
          <div
            key={String(c._id)}
            className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900/30"
          >
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                {String(c.title || "—")}
              </p>
              <p className="text-sm text-gray-500">{String(c.code || "—")}</p>
            </div>
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">
              {fmt(c.value as number | undefined)}
            </span>
          </div>
        ))}
      </div>
    );
  }

  if (logType === "videos") {
    return (
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
        {(items as Record<string, unknown>[]).map((v) => (
          <div
            key={String(v._id)}
            className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="flex h-32 items-center justify-center bg-gray-100 dark:bg-gray-800">
              {v.thumbnailUrl ? (
                <Image
                  src={String(v.thumbnailUrl)}
                  alt={String(v.title || "Video")}
                  width={200}
                  height={128}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Video className="h-8 w-8 text-gray-400" />
              )}
            </div>
            <div className="p-3 text-sm">
              <p className="font-semibold text-gray-900 dark:text-white truncate">
                {String(v.title || "—")}
              </p>
              <p className="text-gray-500">
                {typeof v.durationInSec === "number"
                  ? `${(v.durationInSec / 60).toFixed(1)} min`
                  : "—"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
  <>
    <div className={`hidden md:block ${WALLET_TABLE.shell}`}>
      <div className={WALLET_TABLE.scroll}>
        <Table className="min-w-[900px]">
          <TableHeader className={WALLET_TABLE.header}>
            <TableRow>{renderHeaders(logType)}</TableRow>
          </TableHeader>
          <TableBody className={WALLET_TABLE.body}>
            {items.map((row) =>
              renderRow(logType, row as Record<string, unknown>)
            )}
          </TableBody>
        </Table>
      </div>
    </div>
    <div className="md:hidden space-y-3 p-4">
      {items.map((row) =>
        renderMobileCard(logType, row as Record<string, unknown>)
      )}
    </div>
  </>
  );
}

function renderHeaders(logType: User360LogType) {
  switch (logType) {
    case "earningLogs":
      return (
        <>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Date</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Source</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>From user</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Amount</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Status</TableCell>
        </>
      );
    case "walletTransactions":
      return (
        <>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Date</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Type</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>From</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>To</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Amount</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Status</TableCell>
        </>
      );
    case "orders":
      return (
        <>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Date</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Order</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Items</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Paid</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Status</TableCell>
        </>
      );
    case "referrals":
      return (
        <>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Member</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Contact</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Serial</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Package</TableCell>
          <TableCell isHeader className={WALLET_TABLE.headerCell}>Joined</TableCell>
        </>
      );
    default:
      return null;
  }
}

function renderRow(logType: User360LogType, row: Record<string, unknown>) {
  const key = String(row._id);
  const { date, time } = formatDate(String(row.createdAt || ""));

  if (logType === "earningLogs") {
    const from = row.fromUser as Record<string, unknown> | null;
    return (
      <TableRow key={key} className={WALLET_TABLE.rowHover}>
        <TableCell className={WALLET_TABLE.cell}>
          <div className="font-medium">{date}</div>
          <div className={WALLET_TABLE.cellMuted}>{time}</div>
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>{String(row.source || "—")}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          {from ? (
            <>
              <div>{String(from.email || from.name || "—")}</div>
              <div className={WALLET_TABLE.cellMuted}>
                #{from.serialNumber ?? "—"}
              </div>
            </>
          ) : (
            "—"
          )}
        </TableCell>
        <TableCell className={`${WALLET_TABLE.cell} font-semibold text-emerald-600 dark:text-emerald-400`}>
          {fmt(row.amount as number | undefined)}
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          <Badge size="sm" color="light">{String(row.status || "—")}</Badge>
        </TableCell>
      </TableRow>
    );
  }

  if (logType === "walletTransactions") {
    return (
      <TableRow key={key} className={WALLET_TABLE.rowHover}>
        <TableCell className={WALLET_TABLE.cell}>
          <div className="font-medium">{date}</div>
          <div className={WALLET_TABLE.cellMuted}>{time}</div>
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>{String(row.type || "—")}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>{String(row.fromWallet || "—")}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>{String(row.toWallet || "—")}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>{fmt(row.amount as number | undefined)}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          <Badge size="sm" color="light">{String(row.status || "—")}</Badge>
        </TableCell>
      </TableRow>
    );
  }

  if (logType === "orders") {
    const orderItems = (row.items as Record<string, unknown>[]) || [];
    return (
      <TableRow key={key} className={WALLET_TABLE.rowHover}>
        <TableCell className={WALLET_TABLE.cell}>
          <div className="font-medium">{date}</div>
          <div className={WALLET_TABLE.cellMuted}>{time}</div>
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>…{key.slice(-6)}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          {orderItems.map((i) => (
            <div key={String(i.productId)}>
              {String(i.productTitle)} ×{String(i.quantity)}
            </div>
          ))}
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          {fmt(row.finalAmountPaid as number | undefined)}
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          <Badge size="sm" color="light">{String(row.status || "—")}</Badge>
        </TableCell>
      </TableRow>
    );
  }

  if (logType === "referrals") {
    const pkg = row.package as Record<string, unknown> | null;
    return (
      <TableRow key={key} className={WALLET_TABLE.rowHover}>
        <TableCell className={WALLET_TABLE.cell}>
          <div className="font-semibold">{String(row.name || "—")}</div>
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          <div>{String(row.email || "—")}</div>
          <div className={WALLET_TABLE.cellMuted}>{String(row.phone || "—")}</div>
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>#{String(row.serialNumber ?? "—")}</TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          {pkg && typeof pkg === "object"
            ? String(pkg.name || "—")
            : String(row.package || "—")}
        </TableCell>
        <TableCell className={WALLET_TABLE.cell}>
          <div className="font-medium">{date}</div>
          <div className={WALLET_TABLE.cellMuted}>{time}</div>
        </TableCell>
      </TableRow>
    );
  }

  return null;
}

function renderMobileCard(logType: User360LogType, row: Record<string, unknown>) {
  const key = String(row._id);
  const { date, time } = formatDate(String(row.createdAt || ""));

  return (
    <div key={key} className={WALLET_TABLE.mobileCard}>
      <p className="text-xs text-gray-500">
        {date} · {time}
      </p>
      <p className="font-medium text-gray-900 dark:text-white">
        {logType === "earningLogs" && String(row.source)}
        {logType === "walletTransactions" && String(row.type)}
        {logType === "orders" && `Order …${key.slice(-6)}`}
        {logType === "referrals" && String(row.name)}
      </p>
      {logType === "earningLogs" && (
        <p className="text-sm font-semibold text-emerald-600">
          {fmt(row.amount as number | undefined)}
        </p>
      )}
    </div>
  );
}
