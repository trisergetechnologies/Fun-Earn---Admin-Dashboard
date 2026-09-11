"use client";

import React, { useEffect, useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolBalancesClient() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await autopoolAdmin("/balances");
        setData(res.data);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
      <h2 className="mb-3 text-lg font-semibold">System reserves</h2>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {data && (
        <div className="space-y-2 text-sm">
          <div>Feature Reserve: <strong>{data.featureReserve}</strong></div>
          <div>Admin Allocation: <strong>{data.adminAllocation}</strong></div>
        </div>
      )}
    </div>
  );
}
