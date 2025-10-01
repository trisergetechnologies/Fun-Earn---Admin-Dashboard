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
import ChangeStatusModal from "./ChangeStatusModal";
import OrderDetailsModal from "./OrderDetailsModal";
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

export default function BasicTableOne() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openDetails, setOpenDetails] = useState(false);

  const [statusOrder, setStatusOrder] = useState<Order | null>(null);
  const [openStatus, setOpenStatus] = useState(false);

  // Filters
  const [searchId, setSearchId] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  let token: any


  useEffect(() => {
    token = getToken();
    
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/order/getorders`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setOrders(res.data.data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [token]);

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setOpenDetails(true);
  };

  const openChangeStatus = (order: Order) => {
    setStatusOrder(order);
    setOpenStatus(true);
  };

  // ---- Filtering & Sorting ----
  const filteredOrders = orders
    .filter((o) =>
      searchId ? o._id.toLowerCase().includes(searchId.toLowerCase()) : true
    )
    .filter((o) => (statusFilter ? o.status === statusFilter : true))
    .filter((o) => (paymentFilter ? o.paymentStatus === paymentFilter : true))
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "oldest")
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "amountHigh")
        return b.finalAmountPaid - a.finalAmountPaid;
      if (sortBy === "amountLow")
        return a.finalAmountPaid - b.finalAmountPaid;
      return 0;
    });

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-gray-900">
      {/* Filters Toolbar */}
      <div className="p-4 flex flex-col md:flex-row gap-3 md:items-center md:justify-between border-b border-gray-100 dark:border-white/[0.05]">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Search by Order ID..."
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
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
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="border rounded-md px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Payments</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
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
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders?.map((order) => (
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
                    <div className="flex gap-2">
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
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
    </div>
  );
}
