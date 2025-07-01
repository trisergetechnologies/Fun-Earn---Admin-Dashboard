
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/category/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <ComponentCard title="All Categories">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
