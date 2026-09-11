"use client";

import React, { useCallback, useEffect, useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolOverview() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      await autopoolAdmin("/seed", { method: "POST" });
      const res = await autopoolAdmin("/health");
      setData(res.data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e.message);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="text-lg font-semibold">Auto Pool Overview</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        On/off is controlled by backend env <code className="text-xs">AUTOPOOL_ENABLED</code>
        {" "}(<code className="text-xs">true</code>/<code className="text-xs">false</code>).
        When off, only Autopool join APIs are blocked — existing wallets, orders, and referrals are unchanged.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            Enabled: <strong>{String(data.enabled)}</strong>
            {data.enabledSource ? (
              <span className="ml-1 text-gray-500">({data.enabledSource})</span>
            ) : null}
          </div>
          <div>
            Pools configured: <strong>{data.poolCount}</strong>
          </div>
          <div>
            Occupying participations: <strong>{data.occupyingParticipations}</strong>
          </div>
          <div>
            Feature reserve: <strong>{data.featureReserve}</strong>
          </div>
          <div>
            Admin allocation: <strong>{data.adminAllocation}</strong>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={load}
        className="rounded-lg border px-4 py-2 text-sm"
      >
        Refresh
      </button>
    </div>
  );
}
