"use client";

import React, { useMemo } from "react";
import type { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { useTheme } from "@/context/ThemeContext";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

export interface DailyPoint {
  date: string;
  orderCount: number;
  paidRevenue: number;
}

function dayLabel(ymd: string): string {
  const p = ymd.split("-").map(Number);
  if (p.length !== 3 || p.some((n) => Number.isNaN(n))) return ymd;
  const [y, m, d] = p;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function formatRupeeShort(val: number): string {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}k`;
  return `₹${Math.round(val)}`;
}

interface DashboardOrdersChartProps {
  series: DailyPoint[];
}

export default function DashboardOrdersChart({ series }: DashboardOrdersChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const labelColor = isDark ? "#9CA3AF" : "#6B7280";
  const gridColor = isDark ? "#374151" : "#E5E7EB";

  const categories = useMemo(() => series.map((d) => dayLabel(d.date)), [series]);

  const orderOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        fontFamily: "Outfit, sans-serif",
        height: 260,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#6366F1"],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "72%",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: { fontSize: "11px", colors: [labelColor], fontWeight: 600 },
        formatter: (val: number) => (val > 0 ? String(Math.round(val)) : ""),
      },
      xaxis: {
        categories,
        labels: {
          rotate: -35,
          rotateAlways: series.length > 14,
          style: { colors: labelColor, fontSize: "11px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: { style: { colors: labelColor } },
        title: { text: "Count", style: { color: labelColor, fontSize: "12px" } },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4, xaxis: { lines: { show: false } } },
      tooltip: { theme: isDark ? "dark" : "light", y: { formatter: (v: number) => `${v} orders` } },
    }),
    [categories, series.length, isDark, labelColor, gridColor]
  );

  const revenueOptions: ApexOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        fontFamily: "Outfit, sans-serif",
        height: 260,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      colors: ["#059669"],
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: "72%",
          dataLabels: { position: "top" },
        },
      },
      dataLabels: {
        enabled: true,
        offsetY: -18,
        style: { fontSize: "11px", colors: [labelColor], fontWeight: 600 },
        formatter: (val: number) => (val > 0 ? formatRupeeShort(val) : ""),
      },
      xaxis: {
        categories,
        labels: {
          rotate: -35,
          rotateAlways: series.length > 14,
          style: { colors: labelColor, fontSize: "11px" },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: labelColor },
          formatter: (val: number) => formatRupeeShort(val),
        },
        title: { text: "Rupees", style: { color: labelColor, fontSize: "12px" } },
      },
      grid: { borderColor: gridColor, strokeDashArray: 4, xaxis: { lines: { show: false } } },
      tooltip: {
        theme: isDark ? "dark" : "light",
        y: {
          formatter: (v: number) =>
            new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v),
        },
      },
    }),
    [categories, series.length, isDark, labelColor, gridColor]
  );

  const orderSeries = useMemo(
    () => [{ name: "Orders", data: series.map((d) => d.orderCount) }],
    [series]
  );
  const revenueSeries = useMemo(
    () => [{ name: "Paid amount", data: series.map((d) => Math.round((d.paidRevenue + Number.EPSILON) * 100) / 100) }],
    [series]
  );

  if (!series.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500 dark:text-gray-400">
        No data for this period
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Orders each day</h4>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">How many orders were placed per day.</p>
        <ReactApexChart options={orderOptions} series={orderSeries} type="bar" height={260} />
      </div>
      <div>
        <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-white">Money collected each day</h4>
        <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">Paid amounts only (successful payments).</p>
        <ReactApexChart options={revenueOptions} series={revenueSeries} type="bar" height={260} />
      </div>
    </div>
  );
}
