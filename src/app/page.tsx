"use client";

import { useEffect, useState } from "react";
import {
  Package,
  Tags,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface DashboardData {
  productCount: number;
  categoryCount: number;
  todaySalesCount: number;
  todaySalesTotal: string;
  totalRevenue: string;
  lowStockProducts: Array<{ id: number; name: string; stockQuantity: number; unit: string }>;
  expiringProducts: Array<{ id: number; name: string; expiryDate: string }>;
  recentSales: Array<{ id: number; saleNumber: string; totalAmount: string; paymentMethod: string; customerName: string | null; createdAt: string }>;
  dailySales: Array<{ date: string; total: string; count: number }>;
  topProducts: Array<{ productName: string; totalQty: number; totalRevenue: string }>;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [seeded, setSeeded] = useState(false);

  const seedData = async () => {
    await fetch("/api/seed", { method: "POST" });
    setSeeded(true);
    loadData();
  };

  const loadData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const isEmpty = data && data.productCount === 0 && data.categoryCount === 0;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome to IGMART VENTURES</p>
        </div>
        {isEmpty && !seeded && (
          <button
            onClick={seedData}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-medium flex items-center gap-2"
          >
             Load Sample Data
          </button>
        )}
      </div>

      {/* ALERTS - TOP PRIORITY */}
      {(data?.lowStockProducts.length || data?.expiringProducts.length) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {data?.lowStockProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-red-600 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <AlertTriangle className="w-5 h-5" />
                  <h2 className="font-semibold">Out of Stock & Low Stock</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {data.lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded border border-red-200 cursor-pointer hover:bg-red-100"
                    onClick={() => (window.location.href = "/products")}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">Unit: {product.unit || "pcs"}</p>
                    </div>
                    <span
                      className={`font-bold ${
                        product.stockQuantity === 0
                          ? "text-red-600"
                          : product.stockQuantity <= 3
                          ? "text-red-600"
                          : "text-amber-600"
                      }`}
                    >
                      {product.stockQuantity === 0 ? "OUT OF STOCK" : `${product.stockQuantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data?.expiringProducts.length > 0 && (
            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
              <div className="bg-amber-600 px-4 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5" />
                  <h2 className="font-semibold">Expiring Soon</h2>
                </div>
              </div>
              <div className="p-4 space-y-2">
                {data.expiringProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded border border-amber-200 cursor-pointer hover:bg-amber-100"
                    onClick={() => (window.location.href = "/products")}
                  >
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">Expiry Date</p>
                    </div>
                    <span className="font-bold text-amber-600">
                      {new Date(product.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Products"
          value={data?.productCount ?? 0}
          icon={<Package className="w-6 h-6" />}
          color="bg-blue-500"
          onClick={() => (window.location.href = "/products")}
        />
        <StatCard
          title="Categories"
          value={data?.categoryCount ?? 0}
          icon={<Tags className="w-6 h-6" />}
          color="bg-purple-500"
          onClick={() => (window.location.href = "/categories")}
        />
        <StatCard
          title="Today's Sales"
          value={data?.todaySalesCount ?? 0}
          subtitle={`$${parseFloat(data?.todaySalesTotal ?? "0").toFixed(2)}`}
          icon={<ShoppingCart className="w-6 h-6" />}
          color="bg-green-500"
          onClick={() => (window.location.href = "/sales")}
        />
        <StatCard
          title="Total Revenue"
          value={`$${parseFloat(data?.totalRevenue ?? "0").toFixed(2)}`}
          icon={<DollarSign className="w-6 h-6" />}
          color="bg-amber-500"
          onClick={() => (window.location.href = "/reports")}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-green-600" />
              Recent Sales
            </h2>
            <button
              onClick={() => (window.location.href = "/sales")}
              className="text-sm text-green-600 hover:text-green-700 font-medium"
            >
              View All →
            </button>
          </div>
          {data?.recentSales && data.recentSales.length > 0 ? (
            <div className="space-y-3">
              {data.recentSales.map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                  onClick={() => (window.location.href = "/sales")}
                >
                  <div>
                    <p className="font-medium text-gray-900">{sale.saleNumber}</p>
                    <p className="text-sm text-gray-500">
                      {sale.customerName || "Walk-in"} • {new Date(sale.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      ${parseFloat(sale.totalAmount).toFixed(2)}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        sale.paymentMethod === "cash"
                          ? "bg-green-100 text-green-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {sale.paymentMethod}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No recent sales</div>
          )}
        </div>

        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Sales Last 7 Days
          </h2>
          {data?.dailySales && data.dailySales.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={data.dailySales.map((d) => ({
                  ...d,
                  total: parseFloat(d.total),
                  date: new Date(d.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  }),
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toFixed(2)}`, "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                />
                <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-400">No sales data</div>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Top Selling Products
        </h2>
        {data?.topProducts && data.topProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.topProducts.map((product, index) => (
              <div
                key={product.productName}
                className="flex items-center gap-4 p-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
                onClick={() => (window.location.href = "/products")}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0
                      ? "bg-amber-100 text-amber-700"
                      : index === 1
                      ? "bg-gray-200 text-gray-700"
                      : index === 2
                      ? "bg-orange-100 text-orange-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.productName}</p>
                  <p className="text-xs text-gray-500">{product.totalQty} units sold</p>
                </div>
                <span className="font-bold text-green-600">
                  ${parseFloat(product.totalRevenue).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">No sales data</div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color, onClick }: any) {
  return (
    <div
      className="bg-white rounded-lg shadow border border-gray-200 p-5 cursor-pointer hover:shadow-md transition-all"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {subtitle && <p className="text-sm text-green-600 font-medium mt-1">{subtitle}</p>}
        </div>
        <div className={`${color} text-white p-3 rounded-lg`}>{icon}</div>
      </div>
    </div>
  );
}
