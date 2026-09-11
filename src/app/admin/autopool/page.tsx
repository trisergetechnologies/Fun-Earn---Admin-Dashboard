import AutopoolOverview from "@/components/admin/autopool/AutopoolOverview";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function AutopoolPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Auto Pool" />
      <AutopoolOverview />
    </div>
  );
}
