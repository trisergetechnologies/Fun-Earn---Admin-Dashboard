"use client";

import React, { useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolParticipations() {
  const [serialNumber, setSerialNumber] = useState("");
  const [rows, setRows] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    setError(null);
    try {
      const q = serialNumber ? `?serialNumber=${encodeURIComponent(serialNumber)}` : "";
      const res = await autopoolAdmin(`/participations${q}`);
      setRows(res.data || []);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold">Participations</h2>
      <div className="flex gap-2">
        <input
          className="rounded border px-3 py-2 text-sm"
          placeholder="Serial number (optional)"
          value={serialNumber}
          onChange={(e) => setSerialNumber(e.target.value)}
        />
        <button type="button" onClick={search} className="rounded bg-brand-500 px-3 py-2 text-sm text-white">
          Search
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <table className="min-w-full text-left text-sm">
        <thead>
          <tr className="border-b">
            <th className="p-2">User</th>
            <th className="p-2">Pool</th>
            <th className="p-2">Status</th>
            <th className="p-2">Cycles</th>
            <th className="p-2">Released</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-b">
              <td className="p-2">{r.userId?.serialNumber ?? r.userId?._id}</td>
              <td className="p-2">{r.poolLevel}</td>
              <td className="p-2">{r.status}</td>
              <td className="p-2">{r.cycleCount}</td>
              <td className="p-2">{r.releasedAt ? "yes" : "no"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
