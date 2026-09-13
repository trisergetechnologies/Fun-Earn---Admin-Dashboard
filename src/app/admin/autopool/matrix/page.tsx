import { Suspense } from "react";
import AutopoolMatrix from "@/components/admin/autopool/AutopoolMatrix";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

export default function Page() {
  return (
    <div className="min-w-0 overflow-x-hidden">
      <PageBreadcrumb pageTitle="Loyalty Pool Matrix" />
      <Suspense
        fallback={
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-white/[0.03]">
            Loading Loyalty Pool Matrix…
          </div>
        }
      >
        <AutopoolMatrix />
      </Suspense>
    </div>
  );
}
