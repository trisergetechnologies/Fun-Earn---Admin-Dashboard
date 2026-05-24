export type User360LogType =
  | "earningLogs"
  | "walletTransactions"
  | "orders"
  | "referrals"
  | "coupons"
  | "videos";

export type User360Package = {
  _id?: string;
  name?: string;
  price?: number;
  color?: string;
  icon?: string;
};

export type User360User = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  serialNumber?: number | null;
  referralCode?: string | null;
  referredBy?: string | null;
  package?: User360Package | null;
  wallets?: {
    shortVideoWallet?: number;
    eCartWallet?: number;
    rewardWallet?: unknown[];
  };
  shortVideoProfile?: {
    watchTime?: number;
    videoUploads?: unknown[];
  };
  createdAt?: string;
};

export type User360Achievement = {
  _id: string;
  level: number;
  title: string;
  achievedAt: string;
};

export type User360Summary = {
  user: User360User;
  userId: string;
  wallets: User360User["wallets"];
  shortVideoProfile: User360User["shortVideoProfile"];
  serialNumber: number | null;
  referralCode: string | null;
  referredBy: string | null;
  videoUploadCount: number;
  achievements: User360Achievement[];
  orderSummary: {
    count: number;
    totalOrderValue: number;
    totalPaid: number;
  };
  walletTransactionSummary: {
    totalTransactions: number;
    totals: Record<string, number>;
    grandTotal: number;
  };
  earningLogSummary: {
    totalEarningLogs: number;
    totalEarned: number;
  };
  counts: {
    orders: number;
    walletTransactions: number;
    earningLogs: number;
    coupons: number;
    videos: number;
    referrals: number;
  };
  referralCount: number;
};

export type User360Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type User360LogsResponse = {
  logType: User360LogType;
  items: unknown[];
  pagination: User360Pagination;
};

export type User360SearchQuery =
  | { email: string }
  | { serialNumber: string }
  | { userId: string };

export const USER360_LOG_TABS: { id: User360LogType; label: string }[] = [
  { id: "earningLogs", label: "Earning logs" },
  { id: "walletTransactions", label: "Wallet transactions" },
  { id: "orders", label: "Orders" },
  { id: "referrals", label: "Referrals" },
  { id: "coupons", label: "Coupons" },
  { id: "videos", label: "Videos" },
];
