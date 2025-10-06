
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/payments/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Payments",
  description:
    "Handling payouts or users to their bank.",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Handle Payouts" />
      <div className="space-y-6">
        <ComponentCard title="All Payouts">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
