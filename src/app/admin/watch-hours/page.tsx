
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import BasicTableOne from "@/components/admin/watch-hours/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Watch Hours",
  description:
    "This is Next.js Basic Table  page for TailAdmin  Tailwind CSS Admin Dashboard Template",
  // other metadata
};

export default function BasicTables() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Watch Hours" />
      <div className="space-y-6">
        <ComponentCard title="Eligible Users (Completed 10 Hours)">
          <BasicTableOne />
        </ComponentCard>
      </div>
    </div>
  );
}
