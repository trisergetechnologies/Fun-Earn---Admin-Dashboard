"use client";

import dynamic from "next/dynamic";

const AdminDashboardView = dynamic(
  () => import("./AdminDashboardView"),
  {
    ssr: false,
    loading: () => (
      <div className="flex justify-center py-16">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    ),
  }
);

export default function AdminDashboardLoader() {
  return <AdminDashboardView />;
}
