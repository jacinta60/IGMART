"use client";

import { useEffect, useState } from "react";
import { Scale, Plus, Trash2, X } from "lucide-react";

interface Unit {
  id: number;
  name: string;
  shortName: string | null;
}

export default function UnitsPage() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", shortName: "" });

  const loadUnits = async () => {
    try {
      const res = await fetch("/api/units");
      const data = await res.json();
      setUnits(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      setShowModal(false);
      setForm({ name: "", shortName: "" });
      loadUnits();
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Scale className="w-8 h-8 text-indigo-500" />
            Units Management
          </h1>
          <p className="text-gray-500 mt-1">Manage custom units like Box, Carton, or Pack</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-500 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-600 transition-colors font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Unit
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Unit Name</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Short Name</th>
              <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.map((unit) => (
              <tr key={unit.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium text-gray-800">{unit.name}</td>
                <td className="px-6 py-4 text-gray-500">{unit.shortName || "-"}</td>
                <td className="px-6 py-4 text-right text-gray-400 italic text-sm">
                  System Unit
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold">Add New Unit</h2>
              <button onClick={() => setShowModal(false)}><X /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name (e.g. Carton)</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Short Name (e.g. ctn)</label>
                <input
                  type="text"
                  value={form.shortName}
                  onChange={(e) => setForm({ ...form, shortName: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <button type="submit" className="w-full bg-indigo-500 text-white py-2 rounded-lg font-bold">
                Create Unit
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
