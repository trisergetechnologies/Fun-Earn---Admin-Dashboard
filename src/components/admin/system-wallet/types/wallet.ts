export type WalletTab = "logs" | "weekly" | "monthly";

export type WalletState = {
  totalBalance: number;
  weeklyPool: number;
  monthlyPool: number;
};

export type LogFromUser = {
  id: string;
  name: string;
  serialNumber: number | null;
};

export type SystemLog = {
  _id: string;
  amount: number;
  type: "inflow" | "outflow";
  source: string;
  context: string;
  status: string;
  createdAt: string;
  fromUser: LogFromUser | null;
};

export type AchievementChip = { level: number; title: string };

export type EligibleMember = {
  userId: string;
  name: string;
  serialNumber: number | null;
  referralCode: string;
  packageName: string | null;
  achievements: AchievementChip[];
  eligibleLevels: number[];
  newBuyersSinceLastPayout: number;
  highestLevel: number;
  achievementCount: number;
  topAchievementTitle: string;
  eligibleLevelLabels: string;
  minNewBuyersRequired: number | null;
};

export type EligibleMeta = {
  poolType: string;
  eligibilityRulesActive: boolean;
  lastPayoutAt: string | null;
  thresholds: Record<string, number>;
  cachedAt?: string;
};

export type LogsFilters = {
  search: string;
  type: "all" | "inflow" | "outflow";
  source: string;
};

export type EligibleFilters = {
  search: string;
  level: string;
};

export const LOG_SOURCES = [
  "networkPurchase",
  "teamPurchase",
  "networkWithdrawal",
  "teamWithdrawal",
  "weeklyPayout",
  "monthlyPayout",
  "adminAdjustment",
  "shortVideoToECart",
  "userWithdrawal",
  "rewardReserve",
  "topUp",
] as const;

export const SOURCE_LABELS: Record<string, string> = {
  networkPurchase: "Network purchase",
  teamPurchase: "Team purchase",
  networkWithdrawal: "Network withdrawal",
  teamWithdrawal: "Team withdrawal",
  weeklyPayout: "Weekly payout",
  monthlyPayout: "Monthly payout",
  adminAdjustment: "Admin adjustment",
  shortVideoToECart: "SV to eCart",
  userWithdrawal: "User withdrawal",
  rewardReserve: "Reward reserve",
  topUp: "Top up",
};
