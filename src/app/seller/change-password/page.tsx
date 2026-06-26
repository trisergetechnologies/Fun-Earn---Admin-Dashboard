import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import SellerChangePasswordForm from "@/components/seller/SellerChangePasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Change Password",
};

export default function SellerPasswordPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Change Password" />
      <div className="space-y-6">
        <ComponentCard title="Update your password">
          <SellerChangePasswordForm />
        </ComponentCard>
      </div>
    </div>
  );
}
