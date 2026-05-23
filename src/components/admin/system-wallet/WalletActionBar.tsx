"use client";

import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { getToken } from "@/helper/tokenHelper";
import type { WalletState } from "./types/wallet";

type Props = {
  wallet: WalletState | null;
  onWalletChange: (w: WalletState) => void;
  onAfterPayout: () => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
};

export default function WalletActionBar({
  wallet,
  onWalletChange,
  onAfterPayout,
  loading,
  setLoading,
}: Props) {
  const token = getToken();
  const base = process.env.NEXT_PUBLIC_BASE_URL;

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferPool, setTransferPool] = useState<"weekly" | "monthly">("weekly");
  const [confirmWeeklyOpen, setConfirmWeeklyOpen] = useState(false);
  const [confirmMonthlyOpen, setConfirmMonthlyOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [rechargeAmount, setRechargeAmount] = useState("");
  const [rechargeContext, setRechargeContext] = useState("");
  const [confirmRecharge, setConfirmRecharge] = useState(false);

  const handleTransfer = async () => {
    if (!transferAmount || Number(transferAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `${base}/shortvideo/admin/transferfundstopool`,
        { amount: Number(transferAmount), poolType: transferPool },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        onWalletChange(res.data.data);
        setTransferAmount("");
        setTransferOpen(false);
      } else toast.error(res.data.message || "Transfer failed");
    } catch {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    if (!rechargeAmount || Number(rechargeAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.put(
        `${base}/shortvideo/admin/rechargesystemwallet`,
        { amount: Number(rechargeAmount), context: rechargeContext || "Admin recharge" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        if (wallet) {
          onWalletChange({
            ...wallet,
            totalBalance: res.data?.data?.wallet?.totalBalance ?? wallet.totalBalance,
          });
        }
        setRechargeAmount("");
        setRechargeContext("");
        setConfirmRecharge(false);
        setRechargeOpen(false);
        onAfterPayout();
      } else toast.error(res.data.message || "Recharge failed");
    } catch {
      toast.error("Recharge failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePayWeekly = async () => {
    try {
      const res = await axios.post(
        `${base}/shortvideo/admin/payoutweeklyrewards`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        if (res.data.data?.wallet) onWalletChange(res.data.data.wallet);
        onAfterPayout();
      } else toast.error(res.data.message || "Payout failed");
    } catch {
      toast.error("Weekly payout failed");
    } finally {
      setConfirmWeeklyOpen(false);
    }
  };

  const handlePayMonthly = async () => {
    try {
      const res = await axios.post(
        `${base}/shortvideo/admin/payoutmonthlyrewards`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        onAfterPayout();
      } else toast.error(res.data.message || "Payout failed");
    } catch {
      toast.error("Monthly payout failed");
    } finally {
      setConfirmMonthlyOpen(false);
    }
  };

  return (
    <>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Quick actions
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Recharge the system wallet, run payouts, or move funds into reward pools.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={() => setRechargeOpen(true)}
            className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Recharge wallet
          </button>
          <button
            type="button"
            onClick={() => setConfirmWeeklyOpen(true)}
            className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
          >
            Pay weekly reward
          </button>
          <button
            type="button"
            onClick={() => setConfirmMonthlyOpen(true)}
            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Pay monthly reward
          </button>
          <button
            type="button"
            onClick={() => setTransferOpen(true)}
            className="rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-900/20 dark:text-amber-200 dark:hover:bg-amber-900/30"
          >
            Transfer to pool
          </button>
        </div>
      </section>

      {transferOpen && (
        <Modal title="Transfer to pool" onClose={() => setTransferOpen(false)}>
          <label className="block text-sm mb-1">Amount</label>
          <input
            type="number"
            min={0}
            value={transferAmount}
            onChange={(e) => setTransferAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-800 dark:border-gray-700"
          />
          <label className="block text-sm mb-1">Pool</label>
          <select
            value={transferPool}
            onChange={(e) => setTransferPool(e.target.value as "weekly" | "monthly")}
            className="w-full border rounded-lg px-3 py-2 mb-4 dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <ModalActions
            onCancel={() => setTransferOpen(false)}
            onConfirm={handleTransfer}
            loading={loading}
            confirmLabel="Transfer"
          />
        </Modal>
      )}

      {rechargeOpen && (
        <Modal title="Recharge system wallet" onClose={() => { setRechargeOpen(false); setConfirmRecharge(false); }}>
          <input
            type="number"
            min={0}
            placeholder="Amount"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-3 dark:bg-gray-800 dark:border-gray-700"
          />
          <input
            type="text"
            placeholder="Note (optional)"
            value={rechargeContext}
            onChange={(e) => setRechargeContext(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mb-4 dark:bg-gray-800 dark:border-gray-700"
          />
          {confirmRecharge ? (
            <p className="text-sm text-amber-600 dark:text-amber-400 mb-4">
              Confirm adding ₹{rechargeAmount} to total balance?
            </p>
          ) : null}
          <ModalActions
            onCancel={() => { setRechargeOpen(false); setConfirmRecharge(false); }}
            onConfirm={confirmRecharge ? handleRecharge : () => setConfirmRecharge(true)}
            loading={loading}
            confirmLabel={confirmRecharge ? "Confirm recharge" : "Proceed"}
          />
        </Modal>
      )}

      {confirmWeeklyOpen && (
        <ConfirmModal
          title="Pay weekly reward?"
          body="Distributes the weekly pool to eligible achievers. This cannot be undone."
          onCancel={() => setConfirmWeeklyOpen(false)}
          onConfirm={handlePayWeekly}
          confirmClass="bg-purple-600 hover:bg-purple-700"
        />
      )}

      {confirmMonthlyOpen && (
        <ConfirmModal
          title="Pay monthly reward?"
          body="Distributes the monthly pool to eligible achievers. This cannot be undone."
          onCancel={() => setConfirmMonthlyOpen(false)}
          onConfirm={handlePayMonthly}
          confirmClass="bg-emerald-600 hover:bg-emerald-700"
        />
      )}
    </>
  );
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
        <h2 className="text-lg font-bold mb-4 dark:text-white">{title}</h2>
        {children}
      </div>
    </div>
  );
}

function ModalActions({
  onCancel,
  onConfirm,
  loading,
  confirmLabel,
}: {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
  confirmLabel: string;
}) {
  return (
    <div className="flex justify-end gap-2">
      <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg border dark:border-gray-700">
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={loading}
        className="px-4 py-2 rounded-lg bg-indigo-600 text-white disabled:opacity-50"
      >
        {loading ? "…" : confirmLabel}
      </button>
    </div>
  );
}

function ConfirmModal({
  title,
  body,
  onCancel,
  onConfirm,
  confirmClass,
}: {
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
  confirmClass: string;
}) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} aria-hidden />
      <div className="relative bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
        <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-6">{body}</p>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-md border">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className={`px-4 py-2 rounded-md text-white ${confirmClass}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
