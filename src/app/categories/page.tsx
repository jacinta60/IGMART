"use client";

import { useEffect, useState } from "react";
import { Tags, Plus, Edit2, Trash2, X, Package } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Category {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  productCount: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", description: "" });

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAdd = () => {
    setEditingCategory(null);
    setForm({ name: "", description: "" });
    setShowModal(true);
  };

  const openEdit = (category: Category) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      description: category.description || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingCategory
      ? `/api/categories/${editingCategory.id}`
      : "/api/categories";
    const method = editingCategory ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      loadCategories();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadCategories();
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const colorPalette = [
    "bg-blue-100 text-blue-700 border-blue-200",
    "bg-purple-100 text-purple-700 border-purple-200",
    "bg-green-100 text-green-700 border-green-200",
    "bg-amber-100 text-amber-700 border-amber-200",
    "bg-pink-100 text-pink-700 border-pink-200",
    "bg-cyan-100 text-cyan-700 border-cyan-200",
    "bg-red-100 text-red-700 border-red-200",
    "bg-indigo-100 text-indigo-700 border-indigo-200",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Tags className="w-8 h-8 text-purple-500" />
            Categories
          </h1>
          <p className="text-gray-500 mt-1">Organize your products into categories</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-purple-500 text-white px-5 py-2.5 rounded-lg hover:bg-purple-600 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Tags className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            No categories yet
          </h3>
          <p className="text-gray-400 mb-4">
            Create your first category to organize products
          </p>
          <button
            onClick={openAdd}
            className="bg-purple-500 text-white px-5 py-2.5 rounded-lg hover:bg-purple-600 transition-colors font-medium"
          >
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={category.id}
              className={`rounded-xl border-2 p-6 transition-shadow hover:shadow-md ${
                colorPalette[index % colorPalette.length]
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Tags className="w-6 h-6" />
                  <h3 className="text-lg font-bold">{category.name}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(category)}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => confirmDelete(category.id)}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {category.description && (
                <p className="text-sm opacity-80 mb-4">{category.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm font-medium">
                <Package className="w-4 h-4" />
                {category.productCount} product{category.productCount !== 1 ? "s" : ""}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="e.g., Dairy & Eggs"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  placeholder="Brief description of this category..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
                >
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showConfirm && deleteId && (
        <ConfirmDialog
          title="Delete Category?"
          message="Are you sure you want to delete this category? Products in this category will become uncategorized."
          confirmText="Delete Category"
          type="warning"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
        />
      )}
    </div>
  );
}
