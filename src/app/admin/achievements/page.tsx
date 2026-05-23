import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import AchievementsTable from "@/components/admin/achievements/AchievementsTable";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Weekly and monthly achievement records",
};

export default function AchievementsPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Achievements" />
      <div className="space-y-6">
        <ComponentCard title="Achievement records" desc="Who achieved what — weekly and monthly pools.">
          <AchievementsTable />
        </ComponentCard>
      </div>
    </div>
  );
}
