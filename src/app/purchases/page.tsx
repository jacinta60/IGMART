"use client";

import { useEffect, useState } from "react";
import { Truck, Plus, Package } from "lucide-react";

interface Purchase {
  id: number;
  purchaseNumber: string;
  supplierName: string | null;
  totalAmount: string;
  paymentStatus: string;
  purchaseDate: string;
  itemCount: number;
}

interface Product {
  id: number;
  name: string;
  price: string;
  stockQuantity: number;
}

interface Supplier {
  id: number;
  name: string;
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cart, setCart] = useState<Array<{ productId: number; productName: string; quantity: number; costPrice: number }>>([]);
  const [supplierId, setSupplierId] = useState("");

  const loadData = async () => {
    const [pRes, prodRes, supRes] = await Promise.all([
      fetch("/api/purchases"),
      fetch("/api/products"),
      fetch("/api/suppliers")
    ]);
    setPurchases(await pRes.json());
    setProducts(await prodRes.json());
    setSuppliers(await supRes.json());
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.productId === product.id);
    if (existing) {
      setCart(cart.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { productId: product.id, productName: product.name, quantity: 1, costPrice: parseFloat(product.price) }]);
    }
  };

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    const res = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supplierId: supplierId ? parseInt(supplierId) : null, items: cart }),
    });
    if (res.ok) {
      setShowModal(false);
      setCart([]);
      setSupplierId("");
      loadData();
    }
  };

  const total = cart.reduce((sum, i) => sum + (i.quantity * i.costPrice), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
            <Truck className="w-10 h-10 text-green-600" />
            Stock Purchases
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Purchase inventory from suppliers</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-green-600 text-white px-6 py-3 rounded-2xl hover:bg-green-700 font-bold flex items-center gap-2 shadow-lg">
          <Plus className="w-5 h-5" /> New Purchase
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">PO #</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Supplier</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Items</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
              <th className="text-left px-6 py-4 text-xs font-black text-gray-400 uppercase">Date</th>
              <th className="text-right px-6 py-4 text-xs font-black text-gray-400 uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {purchases.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono font-bold text-gray-900">{p.purchaseNumber}</td>
                <td className="px-6 py-4 font-medium text-gray-600">{p.supplierName || "-"}</td>
                <td className="px-6 py-4"><span className="px-3 py-1 bg-gray-100 rounded-full text-xs font-bold">{p.itemCount} items</span></td>
                <td className="px-6 py-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${p.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{p.paymentStatus}</span></td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(p.purchaseDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right font-black text-gray-900">${parseFloat(p.totalAmount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b flex justify-between items-center">
              <h2 className="text-2xl font-black">New Purchase Order</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl">✕</button>
            </div>
            <div className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold mb-2">Select Supplier</label>
                <select value={supplierId} onChange={e => setSupplierId(e.target.value)} className="w-full border p-3 rounded-xl">
                  <option value="">No Supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {products.map(p => (
                  <button key={p.id} onClick={() => addToCart(p)} className="p-4 border rounded-xl hover:border-green-500 hover:bg-green-50 text-left">
                    <p className="font-bold text-sm">{p.name}</p>
                    <p className="text-xs text-gray-500">Stock: {p.stockQuantity}</p>
                  </button>
                ))}
              </div>
              {cart.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Package className="w-5 h-5" /> Cart ({cart.length} items)</h3>
                  <div className="space-y-2 mb-4">
                    {cart.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium">{item.productName}</span>
                        <div className="flex items-center gap-3">
                          <input type="number" min="1" value={item.quantity} onChange={e => setCart(cart.map((x, idx) => idx === i ? { ...x, quantity: parseInt(e.target.value) || 1 } : x))} className="w-20 border p-2 rounded-lg text-center" />
                          <span className="font-bold">${(item.quantity * item.costPrice).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-lg font-bold">Total:</span>
                    <span className="text-2xl font-black text-green-600">${total.toFixed(2)}</span>
                  </div>
                  <button onClick={handleSubmit} className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg">Complete Purchase</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
