// components/DetailsModal.tsx
"use client";

import { X, Trash2, ShoppingBag, Video, Wallet, User } from "lucide-react";
import Badge from "@/components/ui/badge/Badge";
import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import axios from "axios";
import { getToken } from "@/helper/tokenHelper";
import ConfirmModal from "./ConfirmModal";
import { useRouter } from "next/navigation";

interface Address {
  addressName: string;
  slugName?: string;
  fullName?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phone?: string;
  isDefault?: boolean;
}

interface BankDetails {
  accountHolderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  upiId?: string;
}

interface Package {
  _id: string;
  name: string;
  price: number;
  membersUpto: number;
  description: string;
  icon: string;
  color: string;
  isActive: boolean;
}

interface UserDetails {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  gender?: string;
  applications?: string[];
  referralCode?: string;
  referredBy?: string;
  serialNumber?: number;
  package?: Package; // ✅ Fix: object, not string
  state_address?: string;
  shortVideoProfile?: {
    watchTime?: number;
    videoUploads?: string[];
  };
  eCartProfile?: {
    addresses?: Address[];
    orders?: string[];
    bankDetails?: BankDetails;
  };
  wallets?: {
    shortVideoWallet?: number;
    eCartWallet?: number;
    rewardWallet?: string[];
  };
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  image?: string;
}

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  onDelete: () => void;
  refreshUser: () => void;
  user: UserDetails | null;
}

export default function DetailsModal({
  open,
  onClose,
  onDelete,
  user,
  refreshUser
}: DetailsModalProps) {
  if (!open || !user) return null;

  const router = useRouter();

  const [walletAmount, setWalletAmount] = useState("");
  const [walletLoading, setWalletLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  const [showEcartModal, setShowEcartModal] = useState(false);
  const [showShortVideoModal, setShowShortVideoModal] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [stateAddress, setStateAddress] = useState("");

  const handleRecharge = async () => {
    const amt = Number(walletAmount);
    if (!walletAmount || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    try {
      setWalletLoading(true);
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/rechargeshortvideowallet`,
        { userId: user._id, amount: amt },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (data.success) {
        toast.success(`Recharged ₹${amt} successfully`);
        setWalletAmount("");
        refreshUser();
      } else {
        toast.warn(data.message || "Recharge failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleDeduct = async () => {
    const amt = Number(walletAmount);
    if (!walletAmount || amt <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const balance = user.wallets?.shortVideoWallet || 0;
    if (amt > balance) {
      toast.error(`Insufficient balance. Available: ₹${balance.toFixed(2)}`);
      return;
    }
    try {
      setWalletLoading(true);
      const { data } = await axios.put(
        `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/deductshortvideowallet`,
        { userId: user._id, amount: amt },
        { headers: { Authorization: `Bearer ${getToken()}` } }
      );
      if (data.success) {
        toast.success(`Deducted ₹${amt} from Fun & Enjoy wallet`);
        setWalletAmount("");
        refreshUser();
      } else {
        toast.warn(data.message || "Deduction failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setWalletLoading(false);
    }
  };

  const handleActivateEcart = async () => {
    if (!stateAddress) return;

    try {
      setActivating(true);
      const token = getToken();
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/shortvideo/admin/adminecartactivate`;

      const { data } = await axios.put(
        url,
        { userId: user._id, state_address: stateAddress },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("E-Cart activated successfully 🎉");
        setShowEcartModal(false);
        refreshUser();
      } else {
        toast.warn(data.message);
        setShowEcartModal(false);
      }
    } catch (err) {
      console.error("E-Cart Activation Error:", err);
      toast.error(err?.response?.data?.message || "Failed to activate E-Cart");
      setShowEcartModal(false);
    } finally {
      setActivating(false);
      setShowEcartModal(false);
    }
  };

  const getGenderIconStyle = (gender: string) => {
    const g = (gender || "").toLowerCase();
    if (g === "female") return "bg-pink-100 text-pink-600 dark:bg-pink-900/40 dark:text-pink-400 ring-pink-300";
    if (g === "male") return "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 ring-blue-300";
    return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 ring-gray-300";
  };

  const handleActivateShortVideo = async (referralCode: string) => {
    if (!referralCode) return;

    try {
      setActivating(true);
      const token = getToken();
      const url = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/user/adminshortvideoactivate`;

      const { data } = await axios.put(
        url,
        { userId: user._id, referralCode },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (data.success) {
        toast.success("Short Video activated successfully 🎉");
        setShowShortVideoModal(false);
        refreshUser();
      } else {
        toast.warn(data.message);
        setShowShortVideoModal(false);
      }
    } catch (err) {
      console.error("Short Video Activation Error:", err);
      toast.error(err?.response?.data?.message || "Failed to activate Short Video");
      setShowShortVideoModal(false);
    } finally {
      setActivating(false);
      setShowShortVideoModal(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[95vh] rounded-2xl bg-white dark:bg-gray-900 shadow-2xl relative flex flex-col animate-fadeIn">
        {/* Header - fixed */}
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-gray-200 dark:border-gray-700 p-6 pb-5">
          <div className="flex items-center gap-5 min-w-0">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 ring-4 ring-offset-2 dark:ring-offset-gray-900 ${getGenderIconStyle(user.gender || "other")}`}>
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{user.name}</h2>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {user.gender}
                </span>
                <Badge size="sm" color={user.isActive ? "success" : "error"}>
                  {user.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-200 dark:hover:bg-gray-800"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 mt-2 space-y-8 text-sm text-gray-700 dark:text-gray-300">
          
          {/* Contact Info */}
          <section>
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">📞 Contact Info</h3>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p><span className="font-medium">Email:</span> {user.email || "N/A"}</p>
              <p><span className="font-medium">Phone:</span> {user.phone || "N/A"}</p>
              <p><span className="font-medium">State:</span> {user.state_address || "—"}</p>
              <p><span className="font-medium">Referral Code:</span> {user.referralCode || "—"}</p>
              <p><span className="font-medium">Referred By:</span> {user.referredBy || "—"}</p>
              <p><span className="font-medium">Serial Number:</span> {user.serialNumber || "—"}</p>
              <p><span className="font-medium">Package:</span> {user.package?.name || "—"}</p>
            </div>
          </section>

          {/* Applications */}
          {user.applications && user.applications.length > 0 && (
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">📱 Applications</h3>
              <div className="flex gap-3">
                {user.applications.includes("eCart") && (
                  <Badge size="md" color="primary">
                    <ShoppingBag className="w-4 h-4 mr-1" /> E-Cart
                  </Badge>
                )}
                {user.applications.includes("shortVideo") && (
                  <Badge size="md" color="info">
                    <Video className="w-4 h-4 mr-1" /> Short Video
                  </Badge>
                )}
              </div>
            </section>
          )}


          {/* Admin Activation Options */}
          {user.applications && (
            <section className="mt-6">
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
                ⚙️ Admin Actions
              </h3>
              <div className="flex flex-wrap gap-4">
                {/* E-Cart Activation */}
                {!user.applications.includes("eCart") && (
                  <button
                    onClick={() => setShowEcartModal(true)}
                    disabled={activating}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 font-semibold shadow"
                  >
                    <ShoppingBag className="w-4 h-4" /> Activate E-Cart
                  </button>
                )}

                {/* Short Video Activation */}
                {!user.applications.includes("shortVideo") && (
                  <button
                    onClick={() => setShowShortVideoModal(true)}
                    disabled={activating}
                    className="flex items-center gap-2 px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 font-semibold shadow"
                  >
                    <Video className="w-4 h-4" /> Activate Short Video
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Short Video Profile */}
          {user.shortVideoProfile && (
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">🎬 Short Video Profile</h3>
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p><span className="font-medium">Watch Time:</span> {user.shortVideoProfile.watchTime || 0} mins</p>
                <p><span className="font-medium">Uploaded Videos:</span> {user.shortVideoProfile.videoUploads?.length || 0}</p>
              </div>
            </section>
          )}

          {/* E-Cart Profile */}
          {user.eCartProfile && (
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">🛒 E-Cart Profile</h3>
              <div className="space-y-4">
                {/* Orders */}
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p><span className="font-medium">Total Orders:</span> {user.eCartProfile.orders?.length || 0}</p>
                </div>

                {/* Addresses */}
                {user.eCartProfile.addresses && user.eCartProfile.addresses.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium mb-2">Addresses:</p>
                    <div className="space-y-3">
                      {user.eCartProfile.addresses.map((addr, idx) => (
                        <div key={idx} className="border dark:border-gray-700 p-3 rounded-lg text-sm">
                          <div className="flex justify-between items-center">
                            <p className="font-semibold">{addr.addressName}</p>
                            {addr.isDefault && <Badge color="primary">Default</Badge>}
                          </div>
                          <p>{addr.fullName}, {addr.street}, {addr.city}, {addr.state}, {addr.pincode}</p>
                          <p>📞 {addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bank Details */}
                {user.eCartProfile.bankDetails && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="font-medium mb-2">Bank Details:</p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <p><span className="font-medium">Holder:</span> {user.eCartProfile.bankDetails.accountHolderName || "—"}</p>
                      <p><span className="font-medium">Account No:</span> {user.eCartProfile.bankDetails.accountNumber || "—"}</p>
                      <p><span className="font-medium">IFSC:</span> {user.eCartProfile.bankDetails.ifscCode || "—"}</p>
                      <p><span className="font-medium">UPI:</span> {user.eCartProfile.bankDetails.upiId || "—"}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Wallets */}
          {user.wallets && (
            <section>
              <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">💰 Wallets</h3>
              <div className="grid grid-cols-3 gap-5">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-5 rounded-xl shadow-lg relative">
                  <Wallet className="w-6 h-6 mb-2" />
                  <p className="font-medium">Fun & Enjoy</p>
                  <p className="text-2xl font-bold">
                    ₹{(user.wallets.shortVideoWallet ?? 0).toFixed(2)}
                  </p>

                  {/* Recharge / Deduct - Fun & Enjoy only */}
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-white/80">Admin: Recharge or deduct</p>
                    <div className="flex flex-wrap gap-2">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="Amount"
                        className="flex-1 min-w-0 px-3 py-2 text-sm rounded-lg bg-white/20 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                        value={walletAmount}
                        onChange={(e) => setWalletAmount(e.target.value)}
                        disabled={walletLoading}
                      />
                      <button
                        onClick={handleRecharge}
                        disabled={walletLoading}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-emerald-400 text-gray-900 hover:bg-emerald-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {walletLoading ? "…" : "Recharge"}
                      </button>
                      <button
                        onClick={handleDeduct}
                        disabled={walletLoading}
                        className="px-3 py-2 text-sm font-semibold rounded-lg bg-amber-400 text-gray-900 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {walletLoading ? "…" : "Deduct"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 mb-2" />
                  <p className="font-medium">E-Cart</p>
                  <p className="text-2xl font-bold">₹{user.wallets.eCartWallet?.toFixed(2) || 0}</p>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-5 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 mb-2" />
                  <p className="font-medium">Rewards</p>
                  <p className="text-2xl font-bold">
                    {user.wallets.rewardWallet?.length || 0} coupons
                  </p>
                </div>
              </div>
            </section>
          )}

        </div>

        {/* Footer - fixed */}
        <div className="shrink-0 mt-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700 p-6">
          <button
            disabled={true}
            // onClick={onDelete}
            className="flex items-center gap-2 px-5 py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold shadow"
          >
            <Trash2 className="w-5 h-5" /> Delete User
          </button>
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-semibold"
          >
            Close
          </button>
        </div>
      </div>


      {/* Confirm State for E-Cart */}
      <ConfirmModal
        open={showEcartModal}
        title="Activate E-Cart"
        description="Enter the user's state to activate E-Cart."
        inputLabel="State"
        placeholder="e.g. Karnataka"
        inputValue={stateAddress}
        setInputValue={setStateAddress}
        onClose={() => setShowEcartModal(false)}
        onConfirm={(state) => {
          if (!state) return;
          handleActivateEcart();
        }}
      />

      {/* Confirm Referral for Short Video */}
      <ConfirmModal
        open={showShortVideoModal}
        title="Activate Short Video"
        description="Enter a valid referral code from another user to activate this feature."
        inputLabel="Referral Code"
        placeholder="e.g. ABC123"
        inputValue={inputValue}
        setInputValue={setInputValue}
        onClose={() => setShowShortVideoModal(false)}
        onConfirm={(refCode) => {
          if (!refCode) return;
          handleActivateShortVideo(refCode);
        }}
      />
      <ToastContainer position="top-right" autoClose={2500} theme="colored" />
    </div>
  );
}
