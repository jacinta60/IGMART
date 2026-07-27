"use client";

import { useEffect, useState } from "react";
import { BarChart, DollarSign, TrendingUp, Users, ShoppingCart } from "lucide-react";
import { BarChart as RechartsBar, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ReportData {
  summary: {
    totalSales: string;
    totalExpenses: string;
    grossProfit: string;
    netProfit: string;
    transactionCount: number;
  };
  salesByCashier: Array<{ cashierName: string | null; totalSales: string; transactionCount: number }>;
  bestSellingProducts: Array<{ productName: string; totalQty: number; totalRevenue: string }>;
  profitData: {
    revenue: string;
    costOfGoods: string;
    grossProfit: string;
    expenses: string;
    netProfit: string;
  };
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);

  const loadReports = async () => {
    setLoading(true);
    const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set inside the async callback
  useEffect(() => { loadReports(); }, []);

  const handleGenerate = () => { loadReports(); };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <BarChart className="w-10 h-10 text-green-600" />
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Business insights and performance metrics</p>
        </div>
        <div className="flex gap-3">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded-xl" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded-xl" />
          <button onClick={handleGenerate} className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold">Generate</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <p className="text-sm text-gray-500 font-bold">Total Sales</p>
          </div>
          <p className="text-3xl font-black text-gray-900">${parseFloat(data?.summary.totalSales || "0").toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8 text-blue-600" />
            <p className="text-sm text-gray-500 font-bold">Gross Profit</p>
          </div>
          <p className="text-3xl font-black text-blue-600">${parseFloat(data?.profitData.grossProfit || "0").toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <Wallet className="w-8 h-8 text-red-600" />
            <p className="text-sm text-gray-500 font-bold">Expenses</p>
          </div>
          <p className="text-3xl font-black text-red-600">${parseFloat(data?.summary.totalExpenses || "0").toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            <p className="text-sm text-gray-500 font-bold">Net Profit</p>
          </div>
          <p className="text-3xl font-black text-green-600">${parseFloat(data?.profitData.netProfit || "0").toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Cashier */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><Users className="w-5 h-5" /> Sales by Cashier</h3>
          {data?.salesByCashier && data.salesByCashier.length > 0 ? (
            <div className="space-y-3">
              {data.salesByCashier.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="font-bold text-gray-800">{c.cashierName || "Unknown"}</span>
                  <span className="font-black text-green-600">${parseFloat(c.totalSales).toFixed(2)} ({c.transactionCount} sales)</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400">No data</p>}
        </div>

        {/* Best Selling Products */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5" /> Best Selling Products</h3>
          {data?.bestSellingProducts && data.bestSellingProducts.length > 0 ? (
            <div className="space-y-3">
              {data.bestSellingProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-bold text-gray-800">{p.productName}</p>
                    <p className="text-xs text-gray-500">{p.totalQty} units sold</p>
                  </div>
                  <span className="font-black text-green-600">${parseFloat(p.totalRevenue).toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-gray-400">No data</p>}
        </div>
      </div>
    </div>
  );
}

function Wallet({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
}
