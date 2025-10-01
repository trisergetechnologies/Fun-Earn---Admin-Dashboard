"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";

// ------------------ Types ------------------
interface Wallet {
  totalBalance: number;
  weeklyPool: number;
  monthlyPool: number;
}

interface Log {
  _id: string;
  amount: number;
  source: string;
  fromUser: string;
  context: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// ------------------ Component ------------------
export default function SystemEarningLogs() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(false);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPool, setTransferPool] = useState<"weekly" | "monthly">("weekly");

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<keyof Log | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [confirmWeeklyOpen, setConfirmWeeklyOpen] = useState(false);
  const [confirmMonthlyOpen, setConfirmMonthlyOpen] = useState(false);

  // ✅ keep your token intact
  let token: any

  // Fetch Wallet + Logs
  const fetchData = async () => {
    try {
      const [walletRes, logsRes] = await Promise.all([
        axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getsystemwallet`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getsystemearningLogs`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      setWallet(walletRes.data.data);
      setLogs(logsRes.data.data.logs);
    } catch (err) {
      console.error("Error fetching system data", err);
      toast.error("❌ Failed to fetch system data");
    }
  };
  useEffect(() => {
    token = getToken();
    fetchData();
  }, [token]);

    // Handle fund transfer
  const handleTransfer = async () => {
    if (!transferAmount || Number(transferAmount) <= 0) {
      toast.error("⚠️ Please enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/transferfundstopool`,
        { amount: Number(transferAmount), poolType: transferPool },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        setWallet(res.data.data); // Update wallet UI
        setTransferAmount("");
        setTransferOpen(false);
      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }
    } catch (err) {
      console.error("TransferFunds error:", err);
      toast.error("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Sorting + Filtering
  const filteredLogs = logs?.filter((log) =>
    `${log.source} ${log.context} ${log.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedLogs = filteredLogs && [...filteredLogs]?.sort((a, b) => {
    if (!sortField) return 0;
    const valA = (a[sortField] as any) ?? "";
    const valB = (b[sortField] as any) ?? "";
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  // Handle Rewards
  const handlePayWeekly = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/payoutweeklyrewards`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        fetchData();
      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }
    } catch (err) {
      console.error("Error paying weekly reward", err);
      toast.error("❌ Failed to distribute weekly reward");
    } finally {
      setConfirmWeeklyOpen(false);
    }
  };

  const handlePayMonthly = async () => {
    try {
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/paymonthlyreward`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        fetchData();
      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }
    } catch (err) {
      console.error("Error paying monthly reward", err);
      toast.error("❌ Failed to distribute monthly reward");
    } finally {
      setConfirmMonthlyOpen(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Wallet Summary */}
      {wallet && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <h3 className="text-sm uppercase opacity-80">Total Balance</h3>
            <p className="text-4xl font-extrabold mt-2">
              ₹{wallet.totalBalance.toFixed(2)}
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <h3 className="text-sm uppercase opacity-80">Weekly Pool</h3>
            <p className="text-4xl font-extrabold mt-2">
              ₹{wallet.weeklyPool.toFixed(2)}
            </p>
          </div>
          <div className="p-6 rounded-2xl shadow-lg bg-gradient-to-br from-pink-500 to-rose-600 text-white">
            <h3 className="text-sm uppercase opacity-80">Monthly Pool</h3>
            <p className="text-4xl font-extrabold mt-2">
              ₹{wallet.monthlyPool.toFixed(2)}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
        <button
          onClick={() => setConfirmWeeklyOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-semibold shadow-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:scale-105 transition"
        >
          💸 Pay Weekly Reward
        </button>
        <button
          onClick={() => setConfirmMonthlyOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-semibold shadow-lg bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white hover:scale-105 transition"
        >
          🏦 Pay Monthly Reward
        </button>
        <button
          onClick={() => setTransferOpen(true)}
          className="w-full sm:w-auto px-6 py-3 rounded-xl text-lg font-semibold shadow-lg bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 text-white hover:scale-105 transition"
        >
          🔄 Transfer Funds
        </button>
      </div>

      {/* Transfer Modal */}
      {transferOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setTransferOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-6 animate-fadeIn">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              🔄 Transfer Funds to Pool
            </h2>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Amount
              </label>
              <input
                type="number"
                min="0"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
                placeholder="Enter amount"
              />
            </div>

            {/* Pool Selector */}
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                Select Pool
              </label>
              <select
                value={transferPool}
                onChange={(e) =>
                  setTransferPool(e.target.value as "weekly" | "monthly")
                }
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="weekly">Weekly Pool</option>
                <option value="monthly">Monthly Pool</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setTransferOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleTransfer}
                disabled={loading}
                className="px-5 py-2 bg-yellow-500 text-white rounded-lg font-semibold shadow hover:bg-yellow-600 transition disabled:opacity-50"
              >
                {loading ? "Transferring..." : "Confirm Transfer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-b pb-4">
        <input
          type="text"
          placeholder="🔍 Search by source, status, context..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full md:w-1/3 dark:bg-gray-900 dark:border-gray-700 shadow-sm"
        />
        <div className="flex items-center gap-2">
          <select
            value={sortField}
            onChange={(e) => setSortField(e.target.value as keyof Log)}
            className="border px-4 py-2 rounded-lg dark:bg-gray-900 dark:border-gray-700 shadow-sm"
          >
            <option value="">Sort By</option>
            <option value="amount">Amount</option>
            <option value="source">Source</option>
            <option value="status">Status</option>
            <option value="createdAt">Created At</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-4 py-2 rounded-lg border bg-gray-100 dark:bg-gray-800 shadow-sm"
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[1100px] text-sm">
            <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Amount
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Source
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  From User
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Context
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Date
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Loading logs...
                  </TableCell>
                </TableRow>
              ) : sortedLogs?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                sortedLogs?.map((log, i) => (
                  <TableRow
                    key={log._id}
                    className={`transition ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-800"
                        : "bg-gray-50 dark:bg-gray-900"
                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/40`}
                  >
                    <TableCell className="px-6 py-4 font-medium text-gray-800 dark:text-white">
                      ₹{log.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-6 py-4 capitalize">{log.source}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-500">{log.fromUser}</TableCell>
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {log.context || "—"}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Badge
                        size="sm"
                        color={log.status === "success" ? "success" : "error"}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-xs text-gray-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Weekly Confirmation Modal */}
      {confirmWeeklyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmWeeklyOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Confirm Weekly Reward</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to distribute this week’s rewards to all
              eligible users? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmWeeklyOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePayWeekly}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Yes, Pay Weekly
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Monthly Confirmation Modal */}
      {confirmMonthlyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setConfirmMonthlyOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl text-red-600 font-bold mb-4">This feature is coming soon.</h2>
            <h2 className="text-lg font-semibold mb-4">Confirm Monthly Reward</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to distribute this month’s rewards to all
              eligible users? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmMonthlyOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
              disabled={true}
                onClick={handlePayMonthly}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes, Pay Monthly
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
