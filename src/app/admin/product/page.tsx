
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/product/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Products",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Products" />
      <div className="space-y-6">
        <ComponentCard title="All Products">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
