"use client";

import React from "react";
import Image from "next/image";

export default function OrderDetailsModal({ open, onClose, order }: any) {
  if (!open || !order) return null;

  return (
    <div className="fixed inset-0 z-[9999999] flex items-center justify-center">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-5xl mx-4 my-8 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center border-b px-6 py-4 shrink-0">
          <div>
            <h2 className="text-xl font-semibold">Order #{order._id}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Placed on {new Date(order.createdAt).toLocaleString()} <br />
              Last updated {new Date(order.updatedAt).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Close
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto px-6 py-4 space-y-6">
          {/* Buyer + Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                Buyer Info
              </h3>
              <p>
                <strong>Name:</strong> {order.buyerId?.name}
              </p>
              <p>
                <strong>Email:</strong> {order.buyerId?.email}
              </p>
              <p>
                <strong>Phone:</strong> {order.deliveryAddress?.phone}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-700 dark:text-gray-200">
                Payment Info
              </h3>
              <p>
                <strong>Gateway:</strong> {order.paymentInfo?.gateway}
              </p>
              <p>
                <strong>Payment ID:</strong> {order.paymentInfo?.paymentId}
              </p>
              <p>
                <strong>Payment Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    order.paymentStatus === "paid"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </p>
              <p>
                <strong>Order Status:</strong>{" "}
                <span
                  className={`px-2 py-1 rounded text-sm capitalize ${
                    order.status === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.status === "cancelled"
                      ? "bg-red-100 text-red-700"
                      : order.status === "returned"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>
              </p>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Delivery Address
            </h3>
            <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800">
              <p>{order.deliveryAddress?.fullName}</p>
              <p>
                {order.deliveryAddress?.street}, {order.deliveryAddress?.city},{" "}
                {order.deliveryAddress?.state} - {order.deliveryAddress?.pincode}
              </p>
              <p>
                <strong>Phone:</strong> {order.deliveryAddress?.phone}
              </p>
            </div>
          </div>

          {/* Items */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Ordered Items
            </h3>
            <div className="space-y-3">
              {order.items?.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex gap-4 p-3 border rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <Image
                    src={item.productThumbnail}
                    alt={item.productTitle}
                    width={80}
                    height={80}
                    className="rounded-md"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.productTitle}</p>
                    <p className="text-sm text-gray-500">
                      Qty: {item.quantity} × ₹{item.finalPriceAtPurchase}
                    </p>
                    <p className="text-sm text-gray-400">
                      Return policy: {item.returnPolicyDays} days
                    </p>
                  </div>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    ₹{(item.quantity * item.finalPriceAtPurchase).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Price Summary */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Payment Summary
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <p>
                <strong>Total:</strong> ₹{order.totalAmount}
              </p>
              <p>
                <strong>GST:</strong> ₹{order.totalGstAmount}
              </p>
              <p>
                <strong>Wallet Used:</strong> ₹{order.usedWalletAmount}
              </p>
              <p>
                <strong>Coupon:</strong>{" "}
                {order.usedCouponCode || "Not applied"}
              </p>
              <p className="col-span-2 sm:col-span-3 font-semibold text-lg">
                Final Paid: ₹{order.finalAmountPaid.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Refund / Return / Cancel Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Cancel Requested:</strong>{" "}
                {order.cancelRequested ? "Yes" : "No"}
              </p>
              {order.cancelReason && (
                <p>
                  <strong>Reason:</strong> {order.cancelReason}
                </p>
              )}
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Refund Status:</strong>{" "}
                <span className="capitalize">{order.refundStatus}</span>
              </p>
            </div>
            <div className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800">
              <p>
                <strong>Return Status:</strong>{" "}
                <span className="capitalize">{order.returnStatus}</span>
              </p>
              {order.returnRequested && (
                <p>
                  <strong>Reason:</strong> {order.returnReason || "—"}
                </p>
              )}
            </div>
          </div>

          {/* Tracking */}
          <div>
            <h3 className="font-medium text-gray-700 dark:text-gray-200 mb-2">
              Tracking Updates
            </h3>
            {order.trackingUpdates?.length > 0 ? (
              <div className="space-y-3">
                {order.trackingUpdates?.map((t: any, i: number) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-2 border-b last:border-none"
                  >
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-600" />
                    <div>
                      <p className="font-medium capitalize">{t.status}</p>
                      {t.note && (
                        <p className="text-xs text-gray-500">{t.note}</p>
                      )}
                      <p className="text-xs text-gray-400">
                        {new Date(t.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No tracking updates yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
