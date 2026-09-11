"use client";

import React, { useEffect, useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolConfigs() {
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await autopoolAdmin("/configs");
        setRows(res.data || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-3 text-lg font-semibold">Pool Config</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">Level</th>
            <th className="p-2">Entry</th>
            <th className="p-2">Max cycles</th>
            <th className="p-2">Active</th>
            <th className="p-2">Version</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id || r.poolLevel} className="border-b">
              <td className="p-2">{r.poolLevel}</td>
              <td className="p-2">{r.entryAmount}</td>
              <td className="p-2">{r.maxCycles}</td>
              <td className="p-2">{String(r.active)}</td>
              <td className="p-2">{r.configVersion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
