"use client";
import React, { useEffect, useState } from "react";
import ComponentCard from "../../../common/ComponentCard";
import Label from "../Label";
import Button from "@/components/ui/button/Button";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/settings`;

type PaymentGateway = "ccavenue" | "razorpay";

export default function PaymentGatewaySettings() {
  const [paymentGateway, setPaymentGateway] = useState<PaymentGateway>("ccavenue");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_URL}/getsettings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success) {
          const value = String(res.data.data?.paymentGateway || "ccavenue").toLowerCase();
          setPaymentGateway(value === "razorpay" ? "razorpay" : "ccavenue");
        }
      } catch (err) {
        console.error("Failed to fetch payment gateway settings", err);
      } finally {
        setFetching(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await axios.put(
        `${API_URL}/updatesettings`,
        { paymentGateway },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Payment gateway updated!");
      } else {
        toast.error(res.data.message || "Failed to update");
      }
    } catch (err) {
      console.error("Update payment gateway error:", err);
      toast.error("Failed to update payment gateway");
    } finally {
      setLoading(false);
    }
  };

  const options: { value: PaymentGateway; label: string; desc: string }[] = [
    {
      value: "ccavenue",
      label: "CCAvenue",
      desc: "New checkouts open the CCAvenue payment page",
    },
    {
      value: "razorpay",
      label: "Razorpay",
      desc: "New checkouts open the Razorpay SDK",
    },
  ];

  if (fetching) {
    return (
      <ComponentCard title="Payment Gateway">
        <p className="text-sm text-gray-500">Loading settings...</p>
      </ComponentCard>
    );
  }

  return (
    <ComponentCard title="Payment Gateway">
      <div className="space-y-6">
        <div>
          <Label>Dream Mart checkout</Label>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">
            Applies to new orders. Keep both CCAvenue and Razorpay keys on the
            server. Existing unpaid intents keep their original gateway.
          </p>
          <div className="space-y-3">
            {options.map((opt) => (
              <label
                key={opt.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                  paymentGateway === opt.value
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="paymentGateway"
                  value={opt.value}
                  checked={paymentGateway === opt.value}
                  onChange={() => setPaymentGateway(opt.value)}
                  className="mt-1 accent-indigo-600"
                />
                <div>
                  <p className="font-medium text-sm text-gray-800 dark:text-gray-200">
                    {opt.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {opt.desc}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Payment Gateway"}
          </Button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </ComponentCard>
  );
}
