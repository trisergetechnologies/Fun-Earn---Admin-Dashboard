"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { getToken } from "@/helper/tokenHelper";
import Pagination from "@/components/admin/users/Pagination";
import {
  listBtnAction,
  listBtnPrimary,
  listFilterGroup,
  listFilterInput,
  listFilterSelect,
  listFilterToolbar,
  listPaginationFooter,
  listTableBody,
  listTableHeader,
  listTableRow,
  listTableScroll,
  listTableShell,
} from "@/components/common/listPageStyles";
import { SellerModals } from "./SellerModals";

export interface SellerRecord {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  sellerDetails?: {
    gstin?: string;
    contactPersonName?: string;
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  createdAt: string;
}

const API = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/seller`;

export default function SellersTable() {
  const [sellers, setSellers] = useState<SellerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "true" | "false">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [openCreate, setOpenCreate] = useState(false);
  const [editSeller, setEditSeller] = useState<SellerRecord | null>(null);
  const token = getToken();

  const fetchSellers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: 25 };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "all") params.isActive = statusFilter;
      const res = await axios.get(`${API}/getsellers`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setSellers(res.data?.data?.sellers ?? []);
      setTotalPages(res.data?.data?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, page, search, statusFilter]);

  useEffect(() => {
    fetchSellers();
  }, [fetchSellers]);

  const handleSearch = () => {
    setPage(1);
    fetchSellers();
  };

  return (
    <div className={listTableShell}>
      <div className={listFilterToolbar}>
        <div className={listFilterGroup}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search sellers..."
            className={listFilterInput}
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            className={listFilterSelect}
          >
            <option value="all">All</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
          <button type="button" onClick={handleSearch} className={listBtnPrimary}>
            Search
          </button>
        </div>
        <button type="button" onClick={() => setOpenCreate(true)} className={listBtnPrimary}>
          + Add Seller
        </button>
      </div>

      <div className={listTableScroll}>
        <Table className="min-w-full">
          <TableHeader className={listTableHeader}>
            <TableRow>
              <TableCell isHeader className="px-6 py-3 font-semibold">Company</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Email</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Phone</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">GSTIN</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Status</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className={listTableBody}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : sellers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No sellers found.
                </TableCell>
              </TableRow>
            ) : (
              sellers.map((s) => (
                <TableRow key={s._id} className={listTableRow}>
                  <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {s.name}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.email}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{s.phone}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {s.sellerDetails?.gstin || "—"}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge size="sm" color={s.isActive !== false ? "success" : "error"}>
                      {s.isActive !== false ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setEditSeller(s)}
                      className={listBtnAction}
                    >
                      Manage
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className={listPaginationFooter}>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <SellerModals
        openCreate={openCreate}
        editSeller={editSeller}
        onCloseCreate={() => setOpenCreate(false)}
        onCloseEdit={() => setEditSeller(null)}
        onSaved={fetchSellers}
      />
    </div>
  );
}
