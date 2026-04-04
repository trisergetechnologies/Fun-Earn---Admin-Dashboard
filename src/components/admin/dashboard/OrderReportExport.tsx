"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import { Download } from "lucide-react";

type ExportMode = "month" | "range";

function defaultMonthValue(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function defaultDateYmd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function OrderReportExport() {
  const [mode, setMode] = useState<ExportMode>("month");
  const [monthValue, setMonthValue] = useState(defaultMonthValue);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return defaultDateYmd(d);
  });
  const [to, setTo] = useState(() => defaultDateYmd(new Date()));
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const baseUrl = useMemo(
    () => `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/order/export.xlsx`,
    []
  );

  const download = async () => {
    setMessage(null);
    const token = getToken();
    if (!token) {
      setMessage("Not signed in");
      return;
    }
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (mode === "month") {
        const [y, m] = monthValue.split("-");
        if (!y || !m) {
          setMessage("Pick a month");
          setLoading(false);
          return;
        }
        params.year = y;
        params.month = String(parseInt(m, 10));
      } else {
        if (!from || !to) {
          setMessage("Choose from and to dates");
          setLoading(false);
          return;
        }
        params.from = from;
        params.to = to;
      }

      const res = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params,
        responseType: "blob",
      });

      const dispo = res.headers["content-disposition"] as string | undefined;
      let filename = "orders-report.xlsx";
      if (dispo) {
        const m = /filename="?([^";]+)"?/i.exec(dispo);
        if (m?.[1]) filename = m[1];
      }

      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: unknown) {
      if (axios.isAxiosError(e) && e.response?.data instanceof Blob) {
        try {
          const text = await e.response.data.text();
          const j = JSON.parse(text) as { message?: string };
          setMessage(j.message || "Export failed");
        } catch {
          setMessage("Export failed");
        }
      } else {
        setMessage("Export failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            name="exportMode"
            checked={mode === "month"}
            onChange={() => setMode("month")}
          />
          Month
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
          <input
            type="radio"
            name="exportMode"
            checked={mode === "range"}
            onChange={() => setMode("range")}
          />
          From — to dates
        </label>
      </div>

      {mode === "month" ? (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Month
            </label>
            <input
              type="month"
              value={monthValue}
              onChange={(e) => setMonthValue(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              From
            </label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
              To
            </label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      )}

      {message ? (
        <p className="text-sm text-red-600 dark:text-red-400">{message}</p>
      ) : null}

      <button
        type="button"
        onClick={download}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow hover:bg-indigo-700 disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {loading ? "Preparing…" : "Download Excel"}
      </button>
    </div>
  );
}
