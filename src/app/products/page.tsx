"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  Calendar,
  ChevronRight,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Product {
  id: number;
  name: string;
  description: string | null;
  categoryId: number | null;
  categoryName: string | null;
  price: string;
  costPrice: string;
  stockQuantity: number;
  itemsPerUnit: number;
  expiryDate: string | null;
  barcode: string | null;
  unitId: number | null;
  unitName: string | null;
  unitShort: string | null;
}

interface Category { id: number; name: string; }
interface Unit { id: number; name: string; }

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStock, setFilterStock] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", categoryId: "", price: "", costPrice: "",
    stockQuantity: "", itemsPerUnit: "1", expiryDate: "", barcode: "", unitId: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const pParams = new URLSearchParams();
      if (search) pParams.set("search", search);
      if (filterCategory) pParams.set("categoryId", filterCategory);
      
      const [pRes, cRes, uRes] = await Promise.all([
        fetch(`/api/products?${pParams}`),
        fetch("/api/categories"),
        fetch("/api/units")
      ]);
      
      const [pData, cData, uData] = await Promise.all([
        pRes.json(),
        cRes.json(),
        uRes.json()
      ]);
      
      setProducts(pData);
      setCategories(cData);
      setUnits(uData);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [search, filterCategory]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set inside the async callback
  useEffect(() => { loadData(); }, [loadData]);

  const openAdd = () => {
    setEditingProduct(null);
    setForm({ name: "", description: "", categoryId: "", price: "", costPrice: "", stockQuantity: "", itemsPerUnit: "1", expiryDate: "", barcode: "", unitId: "" });
    setShowModal(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId?.toString() || "",
      price: product.price,
      costPrice: product.costPrice,
      stockQuantity: product.stockQuantity.toString(),
      itemsPerUnit: product.itemsPerUnit.toString(),
      expiryDate: product.expiryDate ? new Date(product.expiryDate).toISOString().split('T')[0] : "",
      barcode: product.barcode || "",
      unitId: product.unitId?.toString() || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingProduct ? `/api/products/${editingProduct.id}` : "/api/products";
    const method = editingProduct ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    if (res.ok) { setShowModal(false); loadData(); }
  };

  const confirmDelete = (id: number) => { setDeleteId(id); setShowConfirm(true); };
  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (res.ok) { loadData(); setShowConfirm(false); setDeleteId(null); }
  };

  const isExpired = (dateStr: string | null) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  const isExpiringSoon = (dateStr: string | null) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);
    return expiry > today && expiry < thirtyDaysFromNow;
  };

  const filteredProducts = products.filter(p => {
    if (filterStock === "low" && p.stockQuantity > 10) return false;
    if (filterStock === "out" && p.stockQuantity > 0) return false;
    if (filterStock === "expiring" && !isExpiringSoon(p.expiryDate)) return false;
    return true;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-green-600" />
            Inventory Management
          </h1>
          <p className="text-gray-500 mt-1">Manage products, stock levels, and expiry dates</p>
        </div>
        <button onClick={openAdd} className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
          <select value={filterStock} onChange={(e) => setFilterStock(e.target.value)} className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
            <option value="">All Stock</option>
            <option value="low">Low Stock (≤10)</option>
            <option value="out">Out of Stock</option>
            <option value="expiring">Expiring Soon</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Package className="w-12 h-12 mb-2" />
            <p>No products found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Product</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Category</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Stock Level</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Expiry Date</th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Price</th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => openEdit(p)}>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        {p.barcode && <p className="text-xs text-gray-400 font-mono mt-0.5">SKU: {p.barcode}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{p.categoryName || "Uncategorized"}</span>
                    </td>
                    <td className="px-6 py-4">
                      {p.stockQuantity === 0 ? (
                        <span className="text-xs px-2.5 py-1 bg-red-100 text-red-700 rounded-full font-medium">Out of Stock</span>
                      ) : p.stockQuantity <= 10 ? (
                        <span className="text-xs px-2.5 py-1 bg-amber-100 text-amber-700 rounded-full font-medium">Low: {p.stockQuantity}</span>
                      ) : (
                        <span className="text-sm font-medium text-gray-900">{p.stockQuantity} {p.unitShort || p.unitName || 'pcs'}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {p.expiryDate ? (
                        <div className={`flex items-center gap-2 ${isExpired(p.expiryDate) ? 'text-red-600' : isExpiringSoon(p.expiryDate) ? 'text-amber-600' : 'text-gray-600'}`}>
                          <Calendar className="w-4 h-4" />
                          <span className="font-medium">{new Date(p.expiryDate).toLocaleDateString()}</span>
                          {isExpired(p.expiryDate) && <AlertTriangle className="w-4 h-4" />}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No expiry</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">${parseFloat(p.price).toFixed(2)}</p>
                      <p className="text-xs text-gray-400">Cost: ${parseFloat(p.costPrice).toFixed(2)}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => confirmDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">{editingProduct ? "Edit" : "Add"} Product</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">None</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                  <select value={form.unitId} onChange={e => setForm({...form, unitId: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none">
                    <option value="">None</option>
                    {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity *</label>
                  <input type="number" min="0" value={form.stockQuantity} onChange={e => setForm({...form, stockQuantity: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items Per Unit</label>
                  <input type="number" min="1" value={form.itemsPerUnit} onChange={e => setForm({...form, itemsPerUnit: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price</label>
                  <input type="number" step="0.01" min="0" value={form.costPrice} onChange={e => setForm({...form, costPrice: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode/SKU</label>
                  <input type="text" value={form.barcode} onChange={e => setForm({...form, barcode: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                  <input type="date" value={form.expiryDate} onChange={e => setForm({...form, expiryDate: e.target.value})} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium">{editingProduct ? "Update" : "Create"} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && deleteId && (
        <ConfirmDialog
          title="Delete Product?"
          message={`Are you sure you want to delete "${editingProduct?.name || 'this product'}"? This will remove it from inventory permanently.`}
          confirmText="Delete Product"
          type="danger"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
        />
      )}
    </div>
  );
}
