"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { Category, Product, Seller } from "./BasicTableOne";
import { getToken } from "@/helper/tokenHelper";
import ModalShell from "@/components/common/ModalShell";
import Badge from "@/components/ui/badge/Badge";

const ADMIN_PRODUCT_API = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/product`;
const SELLER_PRODUCT_API = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/seller/product`;
const ADMIN_CATEGORY_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/category/getcategory`;
const SELLER_CATEGORY_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/seller/category/getcategory`;
const SELLER_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/seller/getsellers?dropdown=true`;
const MAX_IMAGES = 5;

function productApiBase(mode: "admin" | "seller") {
  return mode === "seller" ? SELLER_PRODUCT_API : ADMIN_PRODUCT_API;
}

function categoryUrl(mode: "admin" | "seller") {
  return mode === "seller" ? SELLER_CATEGORY_URL : ADMIN_CATEGORY_URL;
}

// const TOKEN = process.env.NEXT_PUBLIC_ADMIN_TOKEN!;
let TOKEN: any

// ---------- Detail ----------
export function ProductDetail({
  product,
  open,
  mode = "admin",
  onClose,
  onDelete,
  onEdit,
}: {
  product: Product;
  open: boolean;
  mode?: "admin" | "seller";
  onClose: () => void;
  onDelete: (id: string) => void;
  onEdit: (p: Product) => void;
}) {
  if (!open) return null;

  const handleDelete = async () => {
    TOKEN = getToken();
    await axios.delete(`${productApiBase(mode)}/deleteproduct/${product._id}`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    onDelete(product._id);
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title={product.title} maxWidth="max-w-3xl">
      {product.images?.length > 0 && (
        <div className="mb-6 flex gap-3 overflow-x-auto pb-1">
          {product.images.map((img, i) => (
            <img
              key={i}
              src={img}
              alt={product.title}
              className="h-32 w-32 shrink-0 rounded-lg border border-gray-200 object-cover dark:border-gray-700"
            />
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm text-gray-700 dark:text-gray-300 sm:grid-cols-2">
        <p><span className="font-medium">Category:</span> {product.categoryId?.title}</p>
        <p><span className="font-medium">Seller:</span> {product.sellerId?.name || (mode === "seller" ? "You" : "Admin")}</p>
        <p><span className="font-medium">Price:</span> ₹{product.price}</p>
        <p><span className="font-medium">Discount:</span> {product.discountPercent}%</p>
        <p><span className="font-medium">Final Price:</span> ₹{product.finalPrice}</p>
        <p><span className="font-medium">Stock:</span> {product.stock}</p>
        <p><span className="font-medium">GST:</span> {product.gst * 100}%</p>
        <p className="flex items-center gap-2">
          <span className="font-medium">Status:</span>
          <Badge size="sm" color={product.isActive ? "success" : "error"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
        </p>
        <p><span className="font-medium">Created By:</span> {product.createdByRole}</p>
        <p><span className="font-medium">Created:</span> {new Date(product.createdAt).toLocaleString()}</p>
        <p className="sm:col-span-2"><span className="font-medium">Updated:</span> {new Date(product.updatedAt).toLocaleString()}</p>
      </div>

      {(product as any).variations?.length > 0 && (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Variations:</p>
          <div className="flex flex-wrap gap-2">
            {(product as any).variations.map((v: any, i: number) => (
              <span key={i} className="rounded-md bg-gray-100 px-3 py-1 text-xs dark:bg-gray-800">
                <span className="font-medium">{v.name}:</span> {(v.options || []).join(", ")}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-700">
        <button
          type="button"
          onClick={() => onEdit(product)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
        >
          Delete
        </button>
      </div>
    </ModalShell>
  );
}

// ---------- Shared Form ----------
function ProductForm({
  form,
  setForm,
  categories,
  sellers,
  mode = "admin",
  newFiles,
  setNewFiles,
  existingImages,
  setExistingImages,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  form: any;
  setForm: (f: any) => void;
  categories: Category[];
  sellers: Seller[];
  mode?: "admin" | "seller";
  newFiles?: File[];
  setNewFiles?: (f: File[]) => void;
  existingImages?: string[];
  setExistingImages?: (urls: string[]) => void;
  onSubmit: (e: any) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Title */}
      <div className="relative">
        <input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder=" "
          className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        />
        <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
          Title
        </label>
      </div>

      {/* Description */}
      <div className="relative">
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder=" "
          rows={4}
          className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
        />
        <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
          Description
        </label>
      </div>

      {/* Price / Discount / Stock / GST */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Price", key: "price", type: "number" },
          { label: "Discount %", key: "discountPercent", type: "number" },
          { label: "Stock", key: "stock", type: "number" },
          { label: "GST %", key: "gst", type: "number" },
        ].map((f) => (
          <div key={f.key} className="relative">
            <input
              type={f.type}
              value={form[f.key] ?? 0}
              onChange={(e) => setForm({ ...form, [f.key]: +e.target.value })}
              placeholder=" "
              className="peer w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 pt-5 pb-2 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
            />
            <label className="absolute left-3 top-1.5 text-xs text-gray-500 peer-placeholder-shown:top-3 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-400 transition-all">
              {f.label}
            </label>
          </div>
        ))}
      </div>

      {/* Category / Seller */}
      <div className={`grid gap-4 ${mode === "admin" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
        <div className="relative">
          <select
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.title}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2.5 text-xs text-gray-500 bg-white dark:bg-gray-900 px-1">
            Category
          </label>
        </div>

        {mode === "admin" && (
        <div className="relative">
          <select
            value={form.sellerId}
            onChange={(e) => setForm({ ...form, sellerId: e.target.value })}
            className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-3 text-sm bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition"
          >
            <option value="">Select Seller</option>
            {sellers.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
          <label className="absolute left-3 -top-2.5 text-xs text-gray-500 bg-white dark:bg-gray-900 px-1">
            Seller
          </label>
        </div>
        )}
      </div>

      {/* Active Toggle */}
      {mode === "admin" && (
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium">Status</label>
        <button
          type="button"
          onClick={() => setForm({ ...form, isActive: !form.isActive })}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
            form.isActive ? "bg-green-500" : "bg-gray-400"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
              form.isActive ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {form.isActive ? "Active" : "Inactive"}
        </span>
      </div>
      )}

      {/* Variations */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">Variations</label>
          <button
            type="button"
            onClick={() => {
              const variations = form.variations || [];
              setForm({ ...form, variations: [...variations, { name: "", options: "" }] });
            }}
            className="text-xs px-3 py-1 rounded-md bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-300"
          >
            + Add Variation
          </button>
        </div>
        {(form.variations || []).map((v: any, idx: number) => (
          <div key={idx} className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              placeholder="Name (e.g. Size)"
              value={v.name}
              onChange={(e) => {
                const updated = [...form.variations];
                updated[idx] = { ...updated[idx], name: e.target.value };
                setForm({ ...form, variations: updated });
              }}
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:border-indigo-500 outline-none"
            />
            <input
              placeholder="Options (comma separated: S, M, L, XL)"
              value={typeof v.options === 'string' ? v.options : (v.options || []).join(', ')}
              onChange={(e) => {
                const updated = [...form.variations];
                updated[idx] = { ...updated[idx], options: e.target.value };
                setForm({ ...form, variations: updated });
              }}
              className="flex-[2] border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-transparent focus:border-indigo-500 outline-none"
            />
            <button
              type="button"
              onClick={() => {
                const updated = form.variations.filter((_: any, i: number) => i !== idx);
                setForm({ ...form, variations: updated });
              }}
              className="text-red-500 hover:text-red-700 text-lg px-1"
            >
              ×
            </button>
          </div>
        ))}
        {(!form.variations || form.variations.length === 0) && (
          <p className="text-xs text-gray-400">No variations added. Product will have no selectable options.</p>
        )}
      </div>

      {/* Images */}
      {setNewFiles && (
        <div>
          <label className="text-sm font-medium mb-2 block">
            Product Images (max {MAX_IMAGES}, 1MB each)
          </label>
          {existingImages && existingImages.length > 0 && setExistingImages && (
            <div className="flex flex-wrap gap-2 mb-3">
              {existingImages.map((url, i) => (
                <div key={url} className="relative">
                  <img src={url} alt="" className="w-20 h-20 object-cover rounded border" />
                  <button
                    type="button"
                    onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                const total = (existingImages?.length || 0) + picked.length;
                if (total > MAX_IMAGES) {
                  alert(`Maximum ${MAX_IMAGES} images allowed`);
                  return;
                }
                setNewFiles(picked);
              }}
              className="text-sm"
            />
            {newFiles && newFiles.length > 0 && (
              <p className="text-xs text-gray-500 mt-2">{newFiles.length} new file(s) selected</p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-gray-300 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 shadow"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// ---------- Add ----------
export function ProductAdd({
  open,
  mode = "admin",
  onClose,
  onSave,
}: {
  open: boolean;
  mode?: "admin" | "seller";
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<any>({
    title: "",
    description: "",
    price: 0,
    discountPercent: 0,
    stock: 0,
    gst: 5,
    categoryId: "",
    sellerId: "",
    isActive: true,
    variations: [],
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      TOKEN = getToken();
      try {
        const catRes = await axios.get(categoryUrl(mode), {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        setCategories(catRes.data.data || []);
        if (mode === "admin") {
          const sellerRes = await axios.get(SELLER_URL, {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });
          setSellers(sellerRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories/sellers", err);
      }
    };
    if (open) fetchData();
  }, [open, mode]);

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    TOKEN = getToken();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'gst') {
        fd.append(k, String(Number(v) / 100));
      } else if (k === 'variations') {
        const parsed = (v as any[]).map((item: any) => ({
          name: item.name,
          options: typeof item.options === 'string'
            ? item.options.split(',').map((o: string) => o.trim()).filter(Boolean)
            : item.options || []
        })).filter((item: any) => item.name && item.options.length > 0);
        fd.append(k, JSON.stringify(parsed));
      } else {
        fd.append(k, String(v));
      }
    });
    if (newFiles.length === 1) {
      fd.append("image", newFiles[0]);
    } else {
      newFiles.forEach((f) => fd.append("images", f));
    }

    const res = await axios.post(`${productApiBase(mode)}/addproduct`, fd, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.data?.success) {
      alert(res.data?.message || "Failed to add product");
      return;
    }
    onSave(res.data.data);
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title="Add Product" maxWidth="max-w-2xl">
      <ProductForm
        form={form}
        setForm={setForm}
        categories={categories}
        sellers={sellers}
        mode={mode}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Add"
      />
    </ModalShell>
  );
}

// ---------- Update ----------
export function ProductUpdate({
  open,
  mode = "admin",
  product,
  onClose,
  onSave,
}: {
  open: boolean;
  mode?: "admin" | "seller";
  product: Product;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [form, setForm] = useState<any>({
    title: product.title,
    description: product.description,
    price: product.price,
    discountPercent: product.discountPercent,
    stock: product.stock,
    gst: Math.round(product.gst * 100),
    categoryId: product.categoryId?._id || "",
    sellerId: product.sellerId?._id || "",
    isActive: product.isActive,
    variations: ((product as any).variations || []).map((v: any) => ({
      name: v.name || "",
      options: (v.options || []).join(", ")
    })),
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(product.images || []);
  const [categories, setCategories] = useState<Category[]>([]);
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      TOKEN = getToken();
      try {
        const catRes = await axios.get(categoryUrl(mode), {
          headers: { Authorization: `Bearer ${TOKEN}` },
        });
        setCategories(catRes.data.data || []);
        if (mode === "admin") {
          const sellerRes = await axios.get(SELLER_URL, {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });
          setSellers(sellerRes.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching categories/sellers", err);
      }
    };
    if (open) {
      setExistingImages(product.images || []);
      fetchData();
    }
  }, [open, mode, product._id, product.images]);

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    TOKEN = getToken();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'gst') {
        fd.append(k, String(Number(v) / 100));
      } else if (k === 'variations') {
        const parsed = (v as any[]).map((item: any) => ({
          name: item.name,
          options: typeof item.options === 'string'
            ? item.options.split(',').map((o: string) => o.trim()).filter(Boolean)
            : item.options || []
        })).filter((item: any) => item.name && item.options.length > 0);
        fd.append(k, JSON.stringify(parsed));
      } else {
        fd.append(k, String(v));
      }
    });
    fd.append("existingImages", JSON.stringify(existingImages));
    if (newFiles.length === 1) {
      fd.append("image", newFiles[0]);
    } else {
      newFiles.forEach((f) => fd.append("images", f));
    }

    const res = await axios.put(`${productApiBase(mode)}/updateproduct/${product._id}`, fd, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (!res.data?.success) {
      alert(res.data?.message || "Failed to update product");
      return;
    }
    onSave(res.data.data);
    onClose();
  };

  return (
    <ModalShell onClose={onClose} title="Update Product" maxWidth="max-w-2xl">
      <ProductForm
        form={form}
        setForm={setForm}
        categories={categories}
        sellers={sellers}
        mode={mode}
        newFiles={newFiles}
        setNewFiles={setNewFiles}
        existingImages={existingImages}
        setExistingImages={setExistingImages}
        onSubmit={handleSubmit}
        onCancel={onClose}
        submitLabel="Update"
      />
    </ModalShell>
  );
}
