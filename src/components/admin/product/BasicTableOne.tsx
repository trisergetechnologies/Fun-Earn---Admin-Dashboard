"use client";

import { useState, useEffect, useMemo } from "react";
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

  let TOKEN: any

export default function ProductTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openAdd, setOpenAdd] = useState(false);
  const [openUpdate, setOpenUpdate] = useState<Product | null>(null);
  const [openDetail, setOpenDetail] = useState<Product | null>(null);

  // fetch products
  useEffect(() => {
    TOKEN = getToken();
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });

        console.log("Full API response:", res.data);

        // ✅ extract products safely
        const list = res.data?.data?.products || [];
        console.log("Fetched list:", list);

        setProducts(list);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);



  // filters (simplified: only search)
  const [search, setSearch] = useState("");
  const filteredProducts = useMemo(() => {
    return products.filter(
      (p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.sellerId?.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoryId?.title?.toLowerCase().includes(search.toLowerCase())
    );
  }, [products, search]);

  // CRUD handlers
  const handleAdd = (p: Product) => setProducts((prev) => [...prev, p]);
  const handleUpdate = (p: Product) =>
    setProducts((prev) => prev.map((x) => (x._id === p._id ? p : x)));
  const handleDelete = (id: string) =>
    setProducts((prev) => prev.filter((x) => x._id !== id));

  if (loading) return <p>Loading…</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="rounded-xl border p-4 bg-white dark:bg-gray-900">
      {/* Filters */}
      <div className="flex mb-4 gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="border rounded px-3 py-2 text-sm flex-1"
        />
        <button
          onClick={() => setOpenAdd(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded"
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
            {filteredProducts.map((p) => (
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
            ))}
          </TableBody>
        </Table>
      </div>


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
