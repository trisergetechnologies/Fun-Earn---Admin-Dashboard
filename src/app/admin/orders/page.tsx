
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/orders/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
  description:
    "All orders from dream mart",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Orders" />
      <div className="space-y-6">
        <ComponentCard title="All Orders">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
