"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { getToken } from "@/helper/tokenHelper";
import Pagination from "@/components/admin/users/Pagination";
import ModalShell from "@/components/common/ModalShell";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import {
  listBtnAction,
  listBtnDanger,
  listBtnPrimary,
  listFilterGroup,
  listFilterInput,
  listFilterToolbar,
  listPaginationFooter,
  listTableBody,
  listTableHeader,
  listTableRow,
  listTableScroll,
  listTableShell,
} from "@/components/common/listPageStyles";
import { toast } from "react-toastify";

interface CategoryRow {
  _id: string;
  title: string;
  slug: string;
  description?: string;
  isActive: boolean;
  productCount?: number;
}

const API = `${process.env.NEXT_PUBLIC_BASE_URL}/ecart/admin/category`;

export default function CategoriesTable() {
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal] = useState<"create" | CategoryRow | null>(null);
  const token = getToken();

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params: Record<string, string | number> = { manage: "true", page, limit: 25 };
      if (search.trim()) params.search = search.trim();
      const res = await axios.get(`${API}/getcategory`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setCategories(res.data?.data?.categories ?? []);
      setTotalPages(res.data?.data?.totalPages ?? 1);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, page, search]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSearch = () => {
    setPage(1);
    fetchCategories();
  };

  return (
    <div className={listTableShell}>
      <div className={listFilterToolbar}>
        <div className={listFilterGroup}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search categories..."
            className={listFilterInput}
          />
          <button type="button" onClick={handleSearch} className={listBtnPrimary}>
            Search
          </button>
        </div>
        <button type="button" onClick={() => setModal("create")} className={listBtnPrimary}>
          + Add Category
        </button>
      </div>

      <div className={listTableScroll}>
        <Table className="min-w-full">
          <TableHeader className={listTableHeader}>
            <TableRow>
              <TableCell isHeader className="px-6 py-3 font-semibold">Title</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Slug</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Products</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold">Status</TableCell>
              <TableCell isHeader className="px-6 py-3 font-semibold text-center">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className={listTableBody}>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((c) => (
                <TableRow key={c._id} className={listTableRow}>
                  <TableCell className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">
                    {c.title}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">{c.slug}</TableCell>
                  <TableCell className="px-6 py-4 text-gray-600 dark:text-gray-300">
                    {c.productCount ?? 0}
                  </TableCell>
                  <TableCell className="px-6 py-4">
                    <Badge size="sm" color={c.isActive ? "success" : "error"}>
                      {c.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      <button type="button" onClick={() => setModal(c)} className={listBtnAction}>
                        Edit
                      </button>
                      <button
                        type="button"
                        disabled={(c.productCount ?? 0) > 0}
                        onClick={async () => {
                          if (!confirm("Deactivate this category?")) return;
                          await axios.delete(`${API}/deletecategory/${c._id}`, {
                            headers: { Authorization: `Bearer ${token}` },
                          });
                          toast.success("Category deactivated");
                          fetchCategories();
                        }}
                        className={listBtnDanger}
                      >
                        Delete
                      </button>
                    </div>
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

      {modal && (
        <CategoryModal
          category={modal === "create" ? null : modal}
          onClose={() => setModal(null)}
          onSaved={fetchCategories}
        />
      )}
    </div>
  );
}

function CategoryModal({
  category,
  onClose,
  onSaved,
}: {
  category: CategoryRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(category?.title || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [loading, setLoading] = useState(false);
  const token = getToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (category) {
        await axios.patch(
          `${API}/updatecategory/${category._id}`,
          { title, description, isActive },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          `${API}/addcategory`,
          { title, description },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      toast.success("Saved");
      onSaved();
      onClose();
    } catch {
      toast.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalShell
      onClose={onClose}
      title={category ? "Edit Category" : "Add Category"}
      maxWidth="max-w-lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Category title" required />
        </div>
        <div>
          <Label>Description</Label>
          <TextArea value={description} onChange={setDescription} placeholder="Optional description" rows={3} />
        </div>
        {category && (
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="rounded border-gray-300"
            />
            Active
          </label>
        )}
        <div className="flex justify-end gap-3 border-t border-gray-200 pt-5 dark:border-gray-700">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
