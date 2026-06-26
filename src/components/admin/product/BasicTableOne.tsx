"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ProductDetail, ProductAdd, ProductUpdate } from "./ProductModals";
import Pagination from "./Pagination";
import { getToken } from "@/helper/tokenHelper";
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

export interface Category {
  _id: string;
  title: string;
  slug: string;
}

export interface Seller {
  _id: string;
  name: string;
  email: string;
}

export interface Product {
  _id: string;
  sellerId: Seller | null;
  categoryId: Category;
  title: string;
  description: string;
  images: string[];
  price: number;
  gst: number;
  discountPercent: number;
  finalPrice: number;
  createdByRole: string,
  stock: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const ADMIN_API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/product/getproducts`;
const SELLER_API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/seller/product/getproducts`;
const SELLERS_LIST_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/seller/getsellers?dropdown=true`;

export default function ProductTable({ mode = "admin" }: { mode?: "admin" | "seller" }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<Product | null>(null);
  const [openDetail, setOpenDetail] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [sellerFilter, setSellerFilter] = useState("");
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;
  const token = getToken();

  const apiUrl = mode === "seller" ? SELLER_API_URL : ADMIN_API_URL;

  useEffect(() => {
    if (mode !== "admin" || !token) return;
    axios
      .get(SELLERS_LIST_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setSellers(res.data?.data || []))
      .catch(() => {});
  }, [mode, token]);

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, limit };
      if (search.trim()) params.search = search.trim();
      if (mode === "admin" && sellerFilter) params.sellerId = sellerFilter;
      const res = await axios.get(apiUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      const list = res.data?.data?.products ?? [];
      setProducts(list);
      setTotalPages(res.data?.data?.totalPages ?? 1);
    } catch (err: any) {
      setError(err?.message ?? "Failed to fetch");
    } finally {
      setLoading(false);
    }
  }, [token, search, sellerFilter, apiUrl, mode]);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleAdd = (p: Product) => {
    const product = (p as any)?.data ?? p;
    setProducts((prev) => [...prev, product]);
    setTotalPages((t) => Math.max(1, t));
  };
  const handleUpdate = (p: Product) => {
    const product = (p as any)?.data ?? p;
    setProducts((prev) => prev.map((x) => (x._id === product._id ? product : x)));
  };
  const handleDelete = (id: string) =>
    setProducts((prev) => prev.filter((x) => x._id !== id));

  const handleSearchApply = () => {
    setPage(1);
    fetchProducts(1);
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className={listTableShell}>
      <div className={listFilterToolbar}>
        <div className={listFilterGroup}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
            placeholder="Search by title or description..."
            className={listFilterInput}
          />
          <button type="button" onClick={handleSearchApply} className={listBtnPrimary}>
            Search
          </button>
          {mode === "admin" && (
            <select
              value={sellerFilter}
              onChange={(e) => {
                setSellerFilter(e.target.value);
                setPage(1);
              }}
              className={listFilterSelect}
            >
              <option value="">All Sellers</option>
              {sellers.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <button type="button" onClick={() => setOpenAdd(true)} className={listBtnPrimary}>
          + Add Product
        </button>
      </div>

      <div className={listTableScroll}>
        <Table className="min-w-full text-sm">
          <TableHeader className={listTableHeader}>
            <TableRow>
              <TableCell isHeader className="px-6 py-3 font-semibold">Product</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Category</TableCell>
              {mode === "admin" && (
                <TableCell isHeader className="px-6 py-3 font-semibold">Seller</TableCell>
              )}
              <TableCell isHeader className="px-6 py-3 font-semibold text-right">Price</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Status</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className={listTableBody}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={mode === "admin" ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                  Loading…
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={mode === "admin" ? 6 : 5} className="px-6 py-8 text-center text-gray-500">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((p) => (
                <TableRow key={p._id} className={listTableRow}>
                  <TableCell className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src={p.images?.[0] || "/placeholder.png"}
                        alt={p.title}
                        width={48}
                        height={48}
                        className="rounded-md border border-gray-200 dark:border-gray-700"
                      />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{p.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {p.categoryId?.title}
                  </TableCell>
                  {mode === "admin" && (
                    <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                      {p.sellerId?.name || "Admin"}
                    </TableCell>
                  )}
                  <TableCell className="px-6 py-4 text-right font-medium">₹{p.finalPrice}</TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <Badge size="sm" color={p.isActive ? "success" : "error"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <button type="button" onClick={() => setOpenDetail(p)} className={listBtnAction}>
                      View
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
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={(p) => setPage(p)} />
        </div>
      )}

      {/* Modals */}
      {openAdd && (
        <ProductAdd
          open
          mode={mode}
          onClose={() => setOpenAdd(false)}
          onSave={handleAdd}
        />
      )}
      {openUpdate && (
        <ProductUpdate
          open
          mode={mode}
          product={openUpdate}
          onClose={() => setOpenUpdate(null)}
          onSave={handleUpdate}
        />
      )}
      {openDetail && (
        <ProductDetail
          product={openDetail}
          mode={mode}
          open
          onClose={() => setOpenDetail(null)}
          onDelete={handleDelete}
          onEdit={(p) => {
            setOpenDetail(null);
            setOpenUpdate(p);
          }}
        />
      )}
    </div>
  );
}
