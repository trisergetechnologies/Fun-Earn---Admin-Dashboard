"use client";

import { useState } from "react";
import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import { SellerRecord } from "./BasicTableOne";
import ModalShell from "@/components/common/ModalShell";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { toast } from "react-toastify";

const API = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/seller`;

const emptyDetails = {
  gstin: "",
  contactPersonName: "",
  street: "",
  city: "",
  state: "",
  pincode: "",
};

export function SellerModals({
  openCreate,
  editSeller,
  onCloseCreate,
  onCloseEdit,
  onSaved,
}: {
  openCreate: boolean;
  editSeller: SellerRecord | null;
  onCloseCreate: () => void;
  onCloseEdit: () => void;
  onSaved: () => void;
}) {
  return (
    <>
      {openCreate && (
        <SellerFormModal title="Create Seller" onClose={onCloseCreate} onSaved={onSaved} />
      )}
      {editSeller && (
        <SellerFormModal
          title="Edit Seller"
          seller={editSeller}
          onClose={onCloseEdit}
          onSaved={onSaved}
        />
      )}
    </>
  );
}

function SellerFormModal({
  title,
  seller,
  onClose,
  onSaved,
}: {
  title: string;
  seller?: SellerRecord;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    name: seller?.name || "",
    email: seller?.email || "",
    phone: seller?.phone || "",
    password: "",
    isActive: seller?.isActive !== false,
    sellerDetails: { ...emptyDetails, ...seller?.sellerDetails },
  });
  const [resetPwd, setResetPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const token = getToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (seller) {
        await axios.put(
          `${API}/seller/${seller._id}`,
          {
            name: form.name,
            email: form.email,
            phone: form.phone,
            isActive: form.isActive,
            sellerDetails: form.sellerDetails,
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Seller updated");
      } else {
        await axios.post(`${API}/createseller`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Seller created");
      }
      onSaved();
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save seller");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!seller || !resetPwd) return;
    try {
      const res = await axios.put(
        `${API}/seller/${seller._id}/reset-password`,
        { password: resetPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Password reset");
        setResetPwd("");
      } else toast.error(res.data.message);
    } catch {
      toast.error("Password reset failed");
    }
  };

  const handleDeactivate = async () => {
    if (!seller || !confirm("Deactivate this seller and all their products?")) return;
    await axios.delete(`${API}/seller/${seller._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    toast.success("Seller deactivated");
    onSaved();
    onClose();
  };

  const setDetail = (key: keyof typeof emptyDetails, value: string) => {
    setForm({
      ...form,
      sellerDetails: { ...form.sellerDetails, [key]: value },
    });
  };

  return (
    <ModalShell onClose={onClose} title={title} maxWidth="max-w-lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Company name</Label>
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </div>
        {!seller && (
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
        )}
        <div>
          <Label>GSTIN</Label>
          <Input
            value={form.sellerDetails.gstin}
            onChange={(e) => setDetail("gstin", e.target.value.toUpperCase())}
            required
          />
        </div>
        <div>
          <Label>Contact person</Label>
          <Input
            value={form.sellerDetails.contactPersonName}
            onChange={(e) => setDetail("contactPersonName", e.target.value)}
          />
        </div>
        <div>
          <Label>Street</Label>
          <Input value={form.sellerDetails.street} onChange={(e) => setDetail("street", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <Label>City</Label>
            <Input value={form.sellerDetails.city} onChange={(e) => setDetail("city", e.target.value)} />
          </div>
          <div>
            <Label>State</Label>
            <Input value={form.sellerDetails.state} onChange={(e) => setDetail("state", e.target.value)} />
          </div>
          <div>
            <Label>Pincode</Label>
            <Input value={form.sellerDetails.pincode} onChange={(e) => setDetail("pincode", e.target.value)} />
          </div>
        </div>

        {seller && (
          <div className="space-y-4 border-t border-gray-200 pt-4 dark:border-gray-700">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                className="rounded border-gray-300"
              />
              Active
            </label>
            <div>
              <Label>Reset password</Label>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="password"
                  placeholder="New password"
                  value={resetPwd}
                  onChange={(e) => setResetPwd(e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="rounded-lg bg-amber-600 px-4 py-2 text-sm text-white hover:bg-amber-700 sm:shrink-0"
                >
                  Reset
                </button>
              </div>
            </div>
            {seller.isActive !== false && (
              <button
                type="button"
                onClick={handleDeactivate}
                className="w-full rounded-lg bg-red-600 py-2 text-sm text-white hover:bg-red-700"
              >
                Deactivate Seller
              </button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
