import AutopoolConfigs from "@/components/admin/autopool/AutopoolConfigs";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Loyalty Pool Config" />
      <AutopoolConfigs />
    </div>
  );
}
