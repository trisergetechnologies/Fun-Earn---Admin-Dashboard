"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { Calendar, User, Mail, Phone, Wallet, Loader2 } from "lucide-react";
import WithdrawalRequestModal from "./WithdrawalRequestModal";

// ------------------------------ COMPONENT ------------------------------
export default function WithdrawalRequestsAdmin() {
  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Sub filters
  const [search, setSearch] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const token = getToken();

  // Fetch data based on current tab
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/wallet/getwithdrawalrequests?status=${activeTab}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setRequests(res.data.data || []);
      } else {
        toast.error(res.data.message || "Failed to fetch requests");
      }
    } catch (err) {
      console.error("Error fetching withdrawal requests:", err);
      toast.error("❌ Error fetching requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [activeTab]);

  // Filter logic
  const filteredRequests = requests.filter((r) => {
    const matchSearch =
      r.user.name.toLowerCase().includes(search.toLowerCase()) ||
      r.user.email.toLowerCase().includes(search.toLowerCase()) ||
      r.user.phone.includes(search);
    const matchMin = minAmount ? r.amountRequested >= Number(minAmount) : true;
    const matchMax = maxAmount ? r.amountRequested <= Number(maxAmount) : true;
    const matchDate =
      (!dateRange.from || new Date(r.createdAt) >= new Date(dateRange.from)) &&
      (!dateRange.to || new Date(r.createdAt) <= new Date(dateRange.to));

    return matchSearch && matchMin && matchMax && matchDate;
  });

  // Badge colors
  const statusColor = {
    pending: "warning",
    approved: "success",
    rejected: "error",
  } as const;

  return (
    <div className="p-6 space-y-6">
      {/* 🔹 Tabs */}
      <div className="flex gap-3 border-b border-gray-200 dark:border-gray-800 pb-2">
        {["pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2 rounded-t-lg font-semibold transition ${
              activeTab === tab
                ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {tab === "pending" && "🕓 Pending"}
            {tab === "approved" && "✅ Approved"}
            {tab === "rejected" && "❌ Rejected"}
          </button>
        ))}
      </div>

      {/* 🔍 Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <input
          type="text"
          placeholder="Search by name, email or phone"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded-lg flex-1 min-w-[200px] dark:bg-gray-800 dark:border-gray-700"
        />
        <input
          type="number"
          placeholder="Min ₹"
          value={minAmount}
          onChange={(e) => setMinAmount(e.target.value)}
          className="border px-3 py-2 rounded-lg w-24 dark:bg-gray-800 dark:border-gray-700"
        />
        <input
          type="number"
          placeholder="Max ₹"
          value={maxAmount}
          onChange={(e) => setMaxAmount(e.target.value)}
          className="border px-3 py-2 rounded-lg w-24 dark:bg-gray-800 dark:border-gray-700"
        />
        {/* <input
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="border px-3 py-2 rounded-lg dark:bg-gray-800 dark:border-gray-700"
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="border px-3 py-2 rounded-lg dark:bg-gray-800 dark:border-gray-700"
        /> */}
        <button
          onClick={fetchRequests}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Refresh
        </button>
      </div>

      {/* 📋 Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
        <div className="max-w-full overflow-x-auto">
          <Table className="min-w-[1100px] text-sm">
            <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              <TableRow>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  User
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Wallet Balances
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Bank Details
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Requested ₹
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Payout ₹
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Status
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  Date
                </TableCell>
                <TableCell isHeader className="px-6 py-4 font-semibold">
                  More
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center text-gray-500">
                    <Loader2 className="animate-spin w-6 h-6 inline-block mr-2" />
                    Loading requests...
                  </TableCell>
                </TableRow>
              ) : filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No {activeTab} requests found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((req, i) => (
                  <TableRow
                    key={req.requestId}
                    className={`transition ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50 dark:bg-gray-800"
                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/40`}
                  >
                    <TableCell className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-500" /> {req.user.name}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {req.user.email}
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {req.user.phone}
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        <p>
                          <Wallet className="inline w-3 h-3 mr-1 text-green-500" />
                          E-Cart: <strong>₹{req?.walletBalances?.eCartWallet.toFixed(2)}</strong>
                        </p>
                        <p>
                          <Wallet className="inline w-3 h-3 mr-1 text-yellow-500" />
                          ShortVideo: <strong>₹{req?.walletBalances?.shortVideoWallet.toFixed(2)}</strong>
                        </p>
                      </div>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs">
                      <p>{req.bankDetails.accountHolderName}</p>
                      <p className="text-gray-500">{req.bankDetails.upiId || "—"}</p>
                    </TableCell>

                    <TableCell className="px-6 py-4 font-semibold text-gray-800 dark:text-white">
                      ₹{req.amountRequested.toFixed(2)}
                    </TableCell>

                    <TableCell className="px-6 py-4 text-green-600 font-semibold">
                      ₹{req.payoutAmount.toFixed(2)}
                    </TableCell>

                    <TableCell className="px-6 py-4">
                      <Badge size="sm" color={statusColor[req?.status]}>
                        {req.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="px-6 py-4 text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(req.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <button
                        className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-medium shadow-lg"
                        onClick={() => { setSelectedRequest(req); setModalOpen(true); }}
                      >
                        <svg
                          className="w-4 h-4 transform transition-transform duration-200 group-hover:translate-x-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14"></path>
                          <path d="M12 5l7 7-7 7"></path>
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      {modalOpen && (
        <WithdrawalRequestModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          request={selectedRequest}
          onActionComplete={fetchRequests}
        />
      )}

      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
