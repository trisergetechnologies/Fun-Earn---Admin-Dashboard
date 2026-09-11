"use client";

import React, { useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolBootstrap() {
  const [serialNumber, setSerialNumber] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setError(null);
    setMsg(null);
    try {
      const res = await autopoolAdmin("/bootstrap", {
        method: "POST",
        data: { serialNumber },
      });
      setMsg(
        res.data?.alreadyProcessed
          ? "User already occupying Pool 1 (bootstrap ok)"
          : "Bootstrap participation created"
      );
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold">Bootstrap Root</h2>
      <p className="text-sm text-gray-600">
        Place a user into Pool 1 without debit so first real joiners have a valid Autopool-active referrer SN.
      </p>
      <input
        className="rounded border px-3 py-2 text-sm"
        placeholder="Serial number"
        value={serialNumber}
        onChange={(e) => setSerialNumber(e.target.value)}
      />
      <button type="button" onClick={run} className="ml-2 rounded bg-brand-500 px-3 py-2 text-sm text-white">
        Bootstrap
      </button>
      {msg && <p className="text-sm text-green-700">{msg}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
