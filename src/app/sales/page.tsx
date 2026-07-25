"use client";

import { useEffect, useState } from "react";
import {
  Receipt,
  Eye,
  X,
  CreditCard,
  Banknote,
  Calendar,
  User,
  Shield,
} from "lucide-react";

interface Sale {
  id: number;
  saleNumber: string;
  totalAmount: string;
  paymentMethod: string;
  customerName: string | null;
  userId: number | null;
  userName: string | null;
  createdAt: string;
  itemCount: number;
}

interface SaleDetail extends Sale {
  items: Array<{
    id: number;
    productName: string;
    quantity: number;
    unitPrice: string;
    subtotal: string;
  }>;
}

interface CurrentUser {
  id: number;
  name: string;
  role: string;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SaleDetail | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    // Get current user from auth cookie
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith("auth_token="));
    if (cookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
        setUser(userData);
      } catch (e) {}
    }
  }, []);

  const loadSales = async () => {
    try {
      // If staff, only fetch their own sales
      const params = user?.role === "employee" && user?.id ? `?userId=${user.id}` : "";
      const res = await fetch(`/api/sales${params}`);
      const data = await res.json();
      setSales(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadSales();
    }
  }, [user]);

  const viewSale = async (id: number) => {
    const res = await fetch(`/api/sales/${id}`);
    const data = await res.json();
    setSelectedSale(data);
    setShowDetail(true);
  };

  const totalRevenue = sales.reduce(
    (sum, sale) => sum + parseFloat(sale.totalAmount),
    0
  );

  const isAdmin = user?.role === "admin";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Receipt className="w-8 h-8 text-amber-500" />
            Sales History
          </h1>
          <p className="text-gray-500 mt-1">
            {isAdmin ? "View all transactions and sale details" : "View your sales transactions"}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-3">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-2xl font-bold text-green-600">
            ${totalRevenue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* User Badge for Staff */}
      {!isAdmin && user && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center gap-3">
          <User className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-800 font-medium">
            Viewing sales by: <span className="font-bold">{user.name}</span>
          </p>
        </div>
      )}

      {/* Sales Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Transactions</p>
          <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Cash Payments</p>
          <p className="text-2xl font-bold text-green-600">
            {sales.filter((s) => s.paymentMethod === "cash").length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Card Payments</p>
          <p className="text-2xl font-bold text-blue-600">
            {sales.filter((s) => s.paymentMethod === "card").length}
          </p>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500"></div>
          </div>
        ) : sales.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Receipt className="w-12 h-12 mb-2" />
            <p>No sales recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Sale #
                  </th>
                  {isAdmin && (
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                  )}
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-medium text-gray-800">
                      {sale.saleNumber}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 text-gray-600">
                        {sale.userName || (
                          <span className="text-gray-400 italic">Unknown</span>
                        )}
                      </td>
                    )}
                    <td className="px-6 py-4 text-gray-600">
                      {sale.customerName || (
                        <span className="text-gray-400 italic">Walk-in</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full text-sm font-medium">
                        {sale.itemCount} items
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          sale.paymentMethod === "cash"
                            ? "bg-green-100 text-green-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {sale.paymentMethod === "cash" ? (
                          <Banknote className="w-3.5 h-3.5" />
                        ) : (
                          <CreditCard className="w-3.5 h-3.5" />
                        )}
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      ${parseFloat(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(sale.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewSale(sale.id)}
                        className="p-2 text-primary-light hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      {showDetail && selectedSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-800">Sale Details</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-sm">
                  <Receipt className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Sale #:</span>
                  <span className="font-mono font-medium">
                    {selectedSale.saleNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">
                    {new Date(selectedSale.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Customer:</span>
                  <span className="font-medium">
                    {selectedSale.customerName || "Walk-in"}
                  </span>
                </div>
                {isAdmin && selectedSale.userName && (
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-500">Staff:</span>
                    <span className="font-medium">{selectedSale.userName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  {selectedSale.paymentMethod === "cash" ? (
                    <Banknote className="w-4 h-4 text-gray-400" />
                  ) : (
                    <CreditCard className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-gray-500">Payment:</span>
                  <span className="font-medium capitalize">
                    {selectedSale.paymentMethod}
                  </span>
                </div>
              </div>

              {/* Items */}
              <h3 className="font-semibold text-gray-800 mb-3">Items</h3>
              <div className="space-y-2 mb-6">
                {selectedSale.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-800 text-sm">
                        {item.productName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × ${parseFloat(item.unitPrice).toFixed(2)}
                      </p>
                    </div>
                    <span className="font-bold text-gray-800">
                      ${parseFloat(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-semibold text-gray-600">Total Amount:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${parseFloat(selectedSale.totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
