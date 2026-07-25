"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Edit2, Trash2, X, Phone, Mail, MapPin } from "lucide-react";
import { ConfirmDialog } from "@/components/ConfirmDialog";

interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  contactPerson: string | null;
  createdAt: string;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "", contactPerson: "" });

  const loadSuppliers = async () => {
    try {
      const res = await fetch("/api/suppliers");
      const data = await res.json();
      setSuppliers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setForm({ name: "", phone: "", email: "", address: "", contactPerson: "" });
    setShowModal(true);
  };

  const openEdit = (supplier: Supplier) => {
    setEditing(supplier);
    setForm({
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
      contactPerson: supplier.contactPerson || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editing ? `/api/suppliers/${editing.id}` : "/api/suppliers";
    const method = editing ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      loadSuppliers();
    }
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/suppliers/${id}`, { method: "DELETE" });
    if (res.ok) {
      loadSuppliers();
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  const confirmDelete = (id: number) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Truck className="w-10 h-10 text-green-600" />
            Suppliers
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your product suppliers</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5" /> Add Supplier
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div key={supplier.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <Truck className="w-7 h-7 text-green-600" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => openEdit(supplier)} className="p-2 hover:bg-gray-100 rounded-xl transition-all">
                  <Edit2 className="w-4 h-4 text-gray-400" />
                </button>
                <button onClick={() => confirmDelete(supplier.id)} className="p-2 hover:bg-red-50 rounded-xl transition-all">
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{supplier.name}</h3>
            <div className="space-y-2">
              {supplier.contactPerson && (
                <p className="text-sm text-gray-500 font-medium"> {supplier.contactPerson}</p>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" /> {supplier.phone}
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" /> {supplier.email}
                </div>
              )}
              {supplier.address && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mt-0.5" /> {supplier.address}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900">{editing ? "Edit" : "Add"} Supplier</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Company Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Contact Person</label>
                <input type="text" value={form.contactPerson} onChange={e => setForm({...form, contactPerson: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Address</label>
                <textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} rows={3} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                {editing ? "Update" : "Create"} Supplier
              </button>
            </form>
          </div>
        </div>
      )}

      {showConfirm && deleteId && (
        <ConfirmDialog
          title="Delete Supplier?"
          message="Are you sure you want to delete this supplier? This cannot be undone."
          confirmText="Delete Supplier"
          type="danger"
          onConfirm={() => handleDelete(deleteId)}
          onCancel={() => { setShowConfirm(false); setDeleteId(null); }}
        />
      )}
    </div>
  );
}
