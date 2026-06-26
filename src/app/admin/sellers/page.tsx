import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SellersTable from "@/components/admin/sellers/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sellers",
};

export default function SellersPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Sellers" />
      <div className="space-y-6">
        <ComponentCard title="All Sellers">
          <SellersTable />
        </ComponentCard>
      </div>
    </div>
  );
}
