"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Search, Gift, ShoppingCart } from "lucide-react";

interface Customer {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  loyaltyPoints: number;
  totalPurchases: string;
  createdAt: string;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  const loadCustomers = async () => {
    const params = search ? `?search=${encodeURIComponent(search)}` : "";
    const res = await fetch(`/api/customers${params}`);
    const data = await res.json();
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", phone: "", email: "" });
      loadCustomers();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Users className="w-10 h-10 text-green-600" />
            Customers
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage customers and loyalty points</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5" /> Add Customer
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Customer</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Contact</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Loyalty Points</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Total Purchases</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <p className="font-bold text-gray-900">{c.name}</p>
                  <p className="text-xs text-gray-400">Since {new Date(c.createdAt).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-sm font-medium text-gray-600">{c.phone || "-"}</p>
                  <p className="text-xs text-gray-400">{c.email || "-"}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <Gift className="w-4 h-4 text-amber-500" />
                    <span className="font-bold text-amber-600">{c.loyaltyPoints} pts</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-green-500" />
                    <span className="font-bold text-gray-900">${parseFloat(c.totalPurchases).toFixed(2)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black mb-6">Add Customer</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Name *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border p-3 rounded-xl" required />
              <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border p-3 rounded-xl" />
              <button type="submit" className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Save Customer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
