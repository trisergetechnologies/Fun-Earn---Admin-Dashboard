"use client";

import { useEffect, useState, useCallback } from "react";
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
import ChangeStatusModal from "./ChangeStatusModal";
import OrderDetailsModal from "./OrderDetailsModal";
import Pagination from "./Pagination";
import { getToken } from "@/helper/tokenHelper";

interface OrderItem {
  productId: { _id: string; title: string };
  productTitle: string;
  productThumbnail: string;
  quantity: number;
  priceAtPurchase: number;
  finalPriceAtPurchase: number;
}

interface Order {
  _id: string;
  buyerId: { _id: string; name: string; email: string };
  items: OrderItem[];
  status: string;
  finalAmountPaid: number;
  paymentStatus: string;
  createdAt: string;
  deliveryAddress: {
    fullName: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    phone: string;
  };
}

function isInvoiceEligible(order: Pick<Order, "paymentStatus" | "status">) {
  return (
    String(order.paymentStatus || "").toLowerCase() === "paid" &&
    String(order.status || "").toLowerCase() !== "cancelled"
  );
}

export default function BasicTableOne() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [invoiceLoadingId, setInvoiceLoadingId] = useState<string | null>(null);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [openStatus, setOpenStatus] = useState(false);

  // Filters (backend-driven)
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const token = getToken();
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/getorders`;

  const fetchOrders = useCallback(async (pageNum: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, limit, sortBy };
      if (searchId.trim()) params.search = searchId.trim();
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.paymentStatus = paymentFilter;
      if (createdFrom.trim()) params.createdFrom = createdFrom.trim();
      if (createdTo.trim()) params.createdTo = createdTo.trim();
      const res = await axios.get(baseUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params
      });
      setOrders(Array.isArray(res.data.data) ? res.data.data : []);
      if (res.data.pagination) {
        setTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  }, [token, searchId, statusFilter, paymentFilter, sortBy, createdFrom, createdTo, baseUrl]);

  useEffect(() => {
    fetchOrders(page);
  }, [fetchOrders, page]);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const openChangeStatus = (order: Order) => {
    setStatusOrder(order);
    setOpenStatus(true);
  };

  const handleViewInvoice = async (order: Order) => {
    if (!token || !isInvoiceEligible(order)) return;
    setInvoiceLoadingId(order._id);
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/order/invoice/${order._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.data?.success || !res.data?.url) {
        alert(res.data?.message || "Failed to load invoice");
        return;
      }
      window.open(res.data.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Invoice error:", err);
      alert("Failed to load invoice");
    } finally {
      setInvoiceLoadingId(null);
    }
  };

  const handleFilterApply = () => {
    setPage(1);
    fetchOrders(1);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
      {/* Filters Toolbar (backend-driven) */}
      <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFilterApply()}
            placeholder="Search by Order ID..."
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="placed">Placed</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="returned">Returned</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => { setPaymentFilter(e.target.value); setPage(1); }}
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
          <input
            type="date"
            value={createdFrom}
            onChange={(e) => setCreatedFrom(e.target.value)}
            title="Placed from (IST calendar date)"
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="date"
            value={createdTo}
            onChange={(e) => setCreatedTo(e.target.value)}
            title="Placed through (IST calendar date, inclusive)"
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <button
            onClick={handleFilterApply}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
          className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amountHigh">Amount High → Low</option>
          <option value="amountLow">Amount Low → High</option>
        </select>
      </div>

      {/* Table */}
      <div className="max-w-full overflow-x-auto">
        <Table className="min-w-full">
          {/* Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50 dark:bg-gray-800">
            <TableRow>
              <TableCell isHeader>User</TableCell>
              <TableCell isHeader>Items</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader>Payment</TableCell>
              <TableCell isHeader>Amount</TableCell>
              <TableCell isHeader>Date</TableCell>
              <TableCell isHeader>Actions</TableCell>
            </TableRow>
          </TableHeader>

          {/* Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const invoiceOk = isInvoiceEligible(order);
                const invoiceBusy = invoiceLoadingId === order._id;
                return (
                <TableRow
                  key={order._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition"
                >
                  {/* User */}
                  <TableCell className="px-4 py-3">
                    <div>
                      <span className="block font-medium text-gray-800 dark:text-white/90">
                        {order.buyerId.name}
                      </span>
                      <span className="block text-gray-500 text-xs">
                        {order.buyerId.email}
                      </span>
                    </div>
                  </TableCell>

                  {/* Items preview */}
                  <TableCell className="px-4 py-3">
                    <div className="flex -space-x-2">
                      {order.items?.slice(0, 3).map((item, i) => (
                        <Image
                          key={i}
                          src={item.productThumbnail}
                          alt={item.productTitle}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full border border-white dark:border-gray-900"
                        />
                      ))}
                      {order.items.length > 3 && (
                        <span className="text-xs text-gray-500 ml-2">
                          +{order.items?.length - 3} more
                        </span>
                      )}
                    </div>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge
                      size="sm"
                      color={
                        order.status === "placed"
                          ? "warning"
                          : order.status === "processing"
                          ? "info"
                          : order.status === "shipped"
                          ? "primary"
                          : order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                          ? "error"
                          : "info"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>

                  {/* Payment */}
                  <TableCell>
                    <Badge
                      size="sm"
                      color={order.paymentStatus === "paid" ? "success" : "error"}
                    >
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>

                  {/* Amount */}
                  <TableCell className="font-medium text-gray-800 dark:text-white/90">
                    ₹{order.finalAmountPaid.toFixed(2)}
                  </TableCell>

                  {/* Date */}
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>

                  {/* Actions */}
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openOrderDetails(order)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openChangeStatus(order)}
                        className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                      >
                        Change Status
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(order)}
                        disabled={!invoiceOk || invoiceBusy}
                        title={
                          invoiceOk
                            ? "View invoice (opens in new tab)"
                            : "Invoice available only for paid, non-cancelled orders"
                        }
                        className={`px-3 py-1 text-xs rounded-md ${
                          invoiceOk
                            ? "bg-slate-700 text-white hover:bg-slate-800"
                            : "bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-500"
                        }`}
                      >
                        {invoiceBusy ? "Invoice…" : "Invoice"}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modals */}
      {selectedOrder && (
        <OrderDetailsModal
          open={openDetails}
          onClose={() => setOpenDetails(false)}
          order={selectedOrder}
        />
      )}
      {statusOrder && (
        <ChangeStatusModal
          open={openStatus}
          onClose={() => setOpenStatus(false)}
          order={statusOrder}
          onUpdated={(updated) => {
            setOrders((prev) =>
              prev.map((o) => (o._id === updated._id ? { ...o, ...updated } : o))
            );
          }}
        />
      )}

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center p-4 border-t border-gray-100 dark:border-white/[0.05]">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}
    </div>
  );
}
