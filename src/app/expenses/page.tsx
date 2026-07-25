"use client";

import { useEffect, useState } from "react";
import { Wallet, Plus, TrendingDown } from "lucide-react";

interface Expense {
  id: number;
  category: string;
  description: string | null;
  amount: string;
  date: string;
  paidBy: string | null;
}

const categories = ["Electricity", "Water", "Rent", "Transport", "Maintenance", "Salaries", "Supplies", "Other"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ category: "Other", description: "", amount: "", date: "", paidBy: "" });

  const loadExpenses = async () => {
    const res = await fetch("/api/expenses");
    const data = await res.json();
    setExpenses(data);
    setLoading(false);
  };

  useEffect(() => { loadExpenses(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ category: "Other", description: "", amount: "", date: "", paidBy: "" });
      loadExpenses();
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Wallet className="w-10 h-10 text-red-600" />
            Expenses
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Track business expenses</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-red-600 text-white px-6 py-3 rounded-2xl hover:bg-red-700 font-bold flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-bold">Total Expenses</p>
          <p className="text-3xl font-black text-red-600">${totalExpenses.toFixed(2)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Category</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Description</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Date</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Paid By</th>
              <th className="text-right px-6 py-4 text-xs font-black text-gray-400 uppercase">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {expenses.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-xs font-bold">{e.category}</span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.description || "-"}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{e.paidBy || "-"}</td>
                <td className="px-6 py-4 text-right font-bold text-red-600">${parseFloat(e.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><TrendingDown className="w-6 h-6 text-red-600" /> Add Expense</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full border p-3 rounded-xl">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="text" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input type="number" step="0.01" placeholder="Amount *" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="w-full border p-3 rounded-xl" required />
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="w-full border p-3 rounded-xl" />
              <input type="text" placeholder="Paid By" value={form.paidBy} onChange={e => setForm({...form, paidBy: e.target.value})} className="w-full border p-3 rounded-xl" />
              <button type="submit" className="w-full bg-red-600 text-white py-3 rounded-xl font-bold">Record Expense</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
