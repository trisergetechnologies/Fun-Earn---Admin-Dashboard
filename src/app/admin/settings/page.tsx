import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import DefaultInputs from "@/components/admin/settings/form-elements/DefaultInputs";
import DeliverySettings from "@/components/admin/settings/form-elements/DeliverySettings";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Admin settings page",
};

export default function FormElements() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Settings" />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DeliverySettings />
        </div>
        <div className="space-y-6">
          <DefaultInputs />
        </div>
      </div>
    </div>
  );
}
