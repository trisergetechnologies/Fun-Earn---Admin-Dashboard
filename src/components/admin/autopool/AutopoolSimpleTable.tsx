"use client";

import React, { useEffect, useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

function getByPath(row: any, key: string) {
  return key.split(".").reduce((acc, part) => acc?.[part], row);
}

export default function AutopoolSimpleTable({
  title,
  path,
  columns,
}: {
  title: string;
  path: string;
  /** Use dotted paths for nested fields (e.g. userId.serialNumber). No render fns — pages are Server Components. */
  columns: { key: string; label: string }[];
}) {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await autopoolAdmin(path);
        const data = res.data?.ledger || res.data?.balances || res.data;
        setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, [path]);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            {columns.map((c) => (
              <th key={c.key} className="p-2">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r._id || i} className="border-b">
              {columns.map((c) => {
                const value = getByPath(r, c.key);
                return (
                  <td key={c.key} className="p-2">
                    {value == null || value === "" ? "—" : String(value)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
