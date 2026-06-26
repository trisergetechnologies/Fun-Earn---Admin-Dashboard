import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProductTable from "@/components/admin/product/BasicTableOne";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Seller Products",
  description: "Manage your products",
};

export default function SellerProductPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="My Products" />
      <div className="space-y-6">
        <ComponentCard title="Products">
          <ProductTable mode="seller" />
        </ComponentCard>
      </div>
    </div>
  );
}
