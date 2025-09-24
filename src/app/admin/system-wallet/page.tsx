
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/system-wallet/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Wallet & Logs",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="System Wallet & Logs" />
      <div className="space-y-6">
        <ComponentCard title="Logs">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
