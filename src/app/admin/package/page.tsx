import Packages from "@/components/admin/package/Packages";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Packages",
  description:
    "All the packages",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Packages" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
            <Packages/>
        </div>
      </div>
    </div>
  );
}
