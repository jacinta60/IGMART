"use client";

import { useEffect, useState } from "react";
import { Users, Plus, Trash2, X, Shield, User } from "lucide-react";

interface Employee {
  id: number;
  username: string;
  fullName: string | null;
  role: string;
  createdAt: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "employee" });

  const loadEmployees = async () => {
    try {
      const res = await fetch("/api/employees");
      const data = await res.json();
      setEmployees(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set inside the async callback
    loadEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/employees", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ username: "", password: "", fullName: "", role: "employee" });
      loadEmployees();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Users className="w-10 h-10 text-green-600" />
            Employees
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Manage staff accounts and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 transition-all font-bold flex items-center gap-2 shadow-lg shadow-green-100"
        >
          <Plus className="w-5 h-5" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center">
                <User className="w-6 h-6 text-gray-400" />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                emp.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
              }`}>
                {emp.role}
              </span>
            </div>
            <h3 className="text-lg font-bold text-gray-900">{emp.fullName || emp.username}</h3>
            <p className="text-sm text-gray-400 font-medium mb-4">@{emp.username}</p>
            <div className="flex items-center justify-between text-xs text-gray-400 font-bold border-t border-gray-50 pt-4">
              <span>Joined {new Date(emp.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black text-gray-900">New Account</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white rounded-xl transition-all"><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Full Name</label>
                <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Username</label>
                  <input type="text" value={form.username} onChange={e => setForm({...form, username: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                  <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Access Role</label>
                <select value={form.role} onChange={e => setForm({...form, role: e.target.value})} className="w-full border border-gray-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500">
                  <option value="employee">Employee (Sales Only)</option>
                  <option value="admin">Administrator (Full Access)</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg shadow-green-100">
                Create Account
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
