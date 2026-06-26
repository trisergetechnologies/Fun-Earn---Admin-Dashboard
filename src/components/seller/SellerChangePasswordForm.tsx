"use client";

import { useState } from "react";
import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { toast } from "react-toastify";

export default function SellerChangePasswordForm() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = getToken();
      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BASE_URL}/auth/change-password`,
        { oldPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Password changed. Please sign in again.");
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(res.data.message || "Failed to change password");
      }
    } catch {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <div>
        <Label>Current Password</Label>
        <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
      </div>
      <div>
        <Label>New Password</Label>
        <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Change Password"}</Button>
    </form>
  );
}
