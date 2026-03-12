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

const API_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/product/getproducts`;

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<Product | null>(null);
  const [openDetail, setOpenDetail] = useState<Product | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 25;
  const token = getToken();

  const fetchProducts = useCallback(async (pageNum: number = 1) => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page: pageNum, limit };
      if (search.trim()) params.search = search.trim();
      const res = await axios.get(API_URL, {
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
  }, [token, search]);

  useEffect(() => {
    fetchProducts(page);
  }, [fetchProducts, page]);

  const handleAdd = (p: Product) => {
    setProducts((prev) => [...prev, p]);
    setTotalPages((t) => Math.max(1, t));
  };
  const handleUpdate = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x._id === p._id ? p : x)));
  const handleDelete = (id: string) =>
    setProducts((prev) => prev.filter((x) => x._id !== id));

  const handleSearchApply = () => {
    setPage(1);
    fetchProducts(1);
  };

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-gray-900">
      {/* Filters (backend-driven) */}
      <div className="flex flex-wrap mb-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchApply()}
          placeholder="Search by title or description..."
          className="border rounded px-3 py-2 text-sm flex-1 min-w-[200px] dark:bg-gray-800 dark:border-gray-700"
        />
        <button
          onClick={handleSearchApply}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Search
        </button>
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          + Add
        </button>
      </div>

      {/* Table */}
      {/* Table */}
      <div className="overflow-x-auto rounded-lg shadow border border-gray-200 dark:border-gray-700">
        <Table className="w-full text-sm">
          <TableHeader>
            <TableRow className="bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-left">
              <TableCell isHeader className="px-6 py-3 font-semibold">Product</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Category</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Seller</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-right">Price</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Status</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">Loading…</TableCell>
              </TableRow>
            ) : (
            products?.map((p) => (
              <TableRow
                key={p._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                {/* Product */}
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Image
                      src={p.images?.[0] || "/placeholder.png"}
                      alt={p.title}
                      width={48}
                      height={48}
                      className="rounded-md border border-gray-200 dark:border-gray-700"
                    />
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {p.title}
                    </span>
                  </div>
                </TableCell>

                {/* Category */}
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {p.categoryId?.title}
                </TableCell>

                {/* Seller */}
                <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                  {p.sellerId?.name || "Admin"}
                </TableCell>

                {/* Price */}
                <TableCell className="px-6 py-4 text-right font-medium">
                  ₹{p.finalPrice}
                </TableCell>

                {/* Status */}
                <TableCell className="px-6 py-4 text-center">
                  <Badge size="sm" color={p.isActive ? "success" : "error"}>
                    {p.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>

                {/* Actions */}
                <TableCell className="px-6 py-4 text-center">
                  <button
                    onClick={() => setOpenDetail(p)}
                    className="px-3 py-1.5 rounded-md bg-purple-600 text-white text-sm hover:bg-purple-700 transition"
                  >
                    View
                  </button>
                </TableCell>
              </TableRow>
            )))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={(p) => setPage(p)}
          />
        </div>
      )}

      {/* Modals */}
      {openAdd && (
        <ProductAdd
          open
          onClose={() => setOpenAdd(false)}
          onSave={handleAdd}
        />
      )}
      {openUpdate && (
        <ProductUpdate
          open
          product={openUpdate}
          onClose={() => setOpenUpdate(null)}
          onSave={handleUpdate}
        />
      )}
      {openDetail && (
        <ProductDetail
          product={openDetail}
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
