import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CategoriesTable from "@/components/admin/categories/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories",
};

export default function CategoriesPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Categories" />
      <div className="space-y-6">
        <ComponentCard title="All Categories">
          <CategoriesTable />
        </ComponentCard>
      </div>
    </div>
  );
}
