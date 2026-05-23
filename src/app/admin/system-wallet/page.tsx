import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SystemWalletPage from "@/components/admin/system-wallet/SystemWalletPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Wallet & Rewards",
  description: "System wallet, payouts, and eligible members",
};

export default function SystemWalletRoutePage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="System Wallet & Rewards" />
      <div className="space-y-6">
        <ComponentCard
          title="Wallet & reward distribution"
          desc="Manage balances, run payouts, and review transaction logs or eligible members."
        >
          <SystemWalletPage />
        </ComponentCard>
      </div>
    </div>
  );
}
