"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Image from "next/image";
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

interface ShortVideoUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  shortVideoProfile: {
    watchTime: number;
  };
  image?: string;
}

export default function ShortVideoUsersTable() {
  const [users, setUsers] = useState<ShortVideoUser[]>([]);
  const [loading, setLoading] = useState(false);

  const [payAmounts, setPayAmounts] = useState<Record<string, number>>({});
  const [bulkAmount, setBulkAmount] = useState<number>(0);

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("watchtimeDesc");

  const [resetModalOpen, setResetModalOpen] = useState(false); // modal toggle
  const [payAllModalOpen, setPayAllModalOpen] = useState(false);

  // const token = process.env.NEXT_PUBLIC_ADMIN_TOKEN;
  let token: any

  const fetchUsers = async () => {
    setLoading(true);
    token = getToken();
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/getuserswithwatchtime`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(res.data.data || []);
    } catch (err) {
      toast.error("❌ Failed to fetch users!");
    } finally {
      setLoading(false);
    }
  };

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [token]);

  // Filter + sort
  const filteredUsers = users
    .filter((u) =>
      `${u.name} ${u.email} ${u.phone}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "watchtimeAsc")
        return a.shortVideoProfile.watchTime - b.shortVideoProfile.watchTime;
      if (sortBy === "watchtimeDesc")
        return b.shortVideoProfile.watchTime - a.shortVideoProfile.watchTime;
      return a.name.localeCompare(b.name);
    });

  // Single Pay
  const handlePay = async (id: string, amount: number) => {
    if (!amount || amount <= 0) {
      toast.warn("⚠️ Enter a valid amount!");
      return;
    }
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/creditwatchtimeearnings`,
        { amount, userId: id, bulk: false },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        fetchUsers();

      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }
      setPayAmounts((prev) => ({ ...prev, [id]: 0 }));
    } catch (err) {
      toast.error("❌ Error making payment");
    }
  };

  // Pay All
  const handlePayAllConfirmed = async () => {
    setPayAllModalOpen(false);

    if (!bulkAmount || bulkAmount <= 0) {
      toast.warn("⚠️ Enter a valid bulk amount!");
      return;
    }

    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/creditwatchtimeearnings`,
        { amount: bulkAmount, bulk: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        fetchUsers();
      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }

      setBulkAmount(0);
    } catch (err) {
      toast.error("❌ Error paying all users");
    }
  };

  // Reset All confirmed
  const handleResetAllConfirmed = async () => {
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/resetallwatchtime`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`✅ ${res.data.message}`);
        fetchUsers();

      } else {
        toast.error(res.data.message || "❌ Transfer failed");
      }
      setUsers((prev) =>
        prev.map((u) => ({ ...u, shortVideoProfile: { watchTime: 0 } }))
      );
    } catch (err) {
      toast.error("❌ Error resetting watch time");
    } finally {
      setResetModalOpen(false);
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-800 shadow-lg">
      {/* Bulk Actions & Filters */}
      <div className="p-4 flex flex-col md:flex-row justify-between gap-4 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
        {/* Left actions */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="number"
            placeholder="Amount for all"
            value={bulkAmount || ""}
            onChange={(e) => setBulkAmount(Number(e.target.value))}
            className="border px-3 py-2 rounded-md text-sm w-40 dark:bg-gray-900 dark:border-gray-700"
          />
          <button
            onClick={() => setPayAllModalOpen(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium shadow hover:bg-green-700"
          >
            💸 Pay All
          </button>
          <button
            onClick={() => setResetModalOpen(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium shadow hover:bg-red-700"
          >
            ♻️ Reset All
          </button>
        </div>

        {/* Right filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder="🔍 Search by name/email/phone"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm w-64 dark:bg-gray-900 dark:border-gray-700"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border px-3 py-2 rounded-md text-sm dark:bg-gray-900 dark:border-gray-700"
          >
            <option value="watchtimeDesc">Watch Time ↓</option>
            <option value="watchtimeAsc">Watch Time ↑</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-[950px]">
          <TableHeader className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <TableRow>
              <TableCell isHeader>User</TableCell>
              <TableCell isHeader>Email</TableCell>
              <TableCell isHeader>Phone</TableCell>
              <TableCell isHeader>Watch Time</TableCell>
              <TableCell isHeader>Pay</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className="divide-y divide-gray-100 dark:divide-gray-700">
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user, index) => (
                <TableRow
                  key={user._id}
                  className={`transition ${index % 2 === 0
                      ? "bg-white dark:bg-gray-800"
                      : "bg-gray-50 dark:bg-gray-900"
                    } hover:bg-indigo-50 dark:hover:bg-indigo-900/30`}
                >
                  {/* User */}
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                        <Image
                          width={40}
                          height={40}
                          src={user.image || "/images/user/user-21.jpg"}
                          alt={user.name}
                        />
                      </div>
                      <span className="font-medium text-gray-800 dark:text-white">
                        {user.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {user.email}
                  </TableCell>

                  {/* Phone */}
                  <TableCell className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                    {user.phone}
                  </TableCell>

                  {/* Watch Time */}
                  <TableCell>
                    <Badge size="sm" color="info">
                      {(user.shortVideoProfile.watchTime / 3600).toFixed(2)} hrs
                    </Badge>
                  </TableCell>

                  {/* Pay Input */}
                  <TableCell>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="₹"
                        value={payAmounts[user._id] || ""}
                        onChange={(e) =>
                          setPayAmounts((prev) => ({
                            ...prev,
                            [user._id]: Number(e.target.value),
                          }))
                        }
                        className="border px-2 py-1 rounded-md w-24 text-sm dark:bg-gray-900 dark:border-gray-700 [appearance:textfield]"
                      />
                      <button
                        onClick={() =>
                          handlePay(user._id, payAmounts[user._id] || 0)
                        }
                        className="px-3 py-1 bg-indigo-600 text-white rounded-md text-sm shadow hover:bg-indigo-700"
                      >
                        Pay
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Reset Confirmation Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setResetModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-red-600">
              Confirm Reset
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ⚠️ This action will reset <strong>ALL users’ watch time</strong>{" "}
              to <strong>0</strong>. This cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setResetModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetAllConfirmed}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pay All Modal */}
      {payAllModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setPayAllModalOpen(false)}
          />
          <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4 text-green-600">
              Confirm Bulk Payment
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              ⚠️ You are about to pay <strong>₹{bulkAmount}</strong> to{" "}
              <strong>ALL users</strong>.
              Are you sure you want to continue?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPayAllModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePayAllConfirmed}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                ✅ Yes, Pay All
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toastify */}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="colored"
      />
    </div>
  );
}
