"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getToken } from "@/helper/tokenHelper";

export default function ChangeStatusModal({ open, onClose, order, onUpdated }: any) {
  const [status, setStatus] = useState(order?.status || "placed");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setNote("");
    }
  }, [order]);

  if (!open || !order) return null;

  const validStatuses = [
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ];

  const statusColors: Record<string, string> = {
    placed: "bg-blue-100 text-blue-700",
    processing: "bg-yellow-100 text-yellow-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
    returned: "bg-orange-100 text-orange-700",
  };

  const handleUpdate = async () => {
    setLoading(true);
    const token = getToken();
    try {
      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/order/updatestatus/${order._id}`,
        { status, note },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success("✅ Order status updated successfully!");
        onUpdated(res.data.data);
        setTimeout(()=>{onClose()}, 2000)
        
      } else {
        toast.error(`❌ ${res.data.message || "Failed to update status"}`);
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      toast.error("❌ Something went wrong while updating status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 transform animate-scaleIn">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Change Order Status
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-600 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Current Status */}
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Current Status:
            </p>
            <span
              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                statusColors[order.status] || "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          {/* Dropdown */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              New Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
            >
              {validStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes for this update..."
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:border-gray-700"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t px-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-5 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Status"}
          </button>
        </div>
      </div>

      {/* Animation */}
      <style jsx>{`
        .animate-scaleIn {
          animation: scaleIn 0.25s ease-out;
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
