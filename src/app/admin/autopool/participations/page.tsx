import AutopoolParticipations from "@/components/admin/autopool/AutopoolParticipations";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function Page() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Auto Pool Participations" />
      <AutopoolParticipations />
    </div>
  );
}
