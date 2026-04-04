import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AdminDashboardLoader from "@/components/admin/dashboard/AdminDashboardLoader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Admin overview, order stats, and exports",
};

export default function AdminDashboardPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Dashboard" />
      <AdminDashboardLoader />
    </div>
  );
}
