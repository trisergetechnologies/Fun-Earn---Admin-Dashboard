"use client";

import React, { useEffect, useState } from "react";
import { autopoolAdmin } from "@/lib/autopoolAdminApi";

export default function AutopoolCreditsClient() {
  const [balances, setBalances] = useState<any[]>([]);
  const [ledger, setLedger] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await autopoolAdmin("/credits");
        setBalances(res.data?.balances || []);
        setLedger(res.data?.ledger || []);
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message);
      }
    })();
  }, []);

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">Credit balances</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Balance</th>
            </tr>
          </thead>
          <tbody>
            {balances.map((b) => (
              <tr key={b._id} className="border-b">
                <td className="p-2">{b.userId?.serialNumber ?? b.userId?._id}</td>
                <td className="p-2">{b.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-semibold">Credit ledger</h2>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Type</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">After</th>
              <th className="p-2 text-left">Reason</th>
            </tr>
          </thead>
          <tbody>
            {ledger.map((r) => (
              <tr key={r._id} className="border-b">
                <td className="p-2">{r.type}</td>
                <td className="p-2">{r.amount}</td>
                <td className="p-2">{r.balanceAfter}</td>
                <td className="p-2">{r.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
