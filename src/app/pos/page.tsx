"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  CheckCircle,
  X,
  Smartphone,
  User,
} from "lucide-react";

interface Product {
  id: number;
  name: string;
  price: string;
  stockQuantity: number;
  itemsPerUnit: number;
  categoryId: number | null;
  categoryName: string | null;
  unitName: string | null;
  unitShort: string | null;
  barcode: string | null;
  expiryDate: string | null;
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

interface CartItem {
  productId: number;
  productName: string;
  unitPrice: number;
  quantity: number;
  maxStock: number;
  unitName: string | null;
  itemsPerUnit: number;
  editMode?: boolean;
}

function readUserId(): number | null {
  if (typeof document === "undefined") return null;
  const cookie = document.cookie
    .split("; ")
    .find((row) => row.startsWith("auth_token="));
  if (!cookie) return null;
  try {
    return JSON.parse(decodeURIComponent(cookie.split("=")[1])).id;
  } catch {
    return null;
  }
}

export default function POSPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastSale, setLastSale] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [userId] = useState<number | null>(readUserId);
  const [editingQty, setEditingQty] = useState<{[key: number]: string}>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<Array<{id: number; name: string}>>([]);

  useEffect(() => {
    // Load categories
    fetch("/api/categories").then(r => r.json()).then(setCategories);
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = search === "" || 
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
    const matchesCategory = selectedCategory === "" || p.categoryId === parseInt(selectedCategory);
    return matchesSearch && matchesCategory;
  });

  const loadProducts = useCallback(async () => {
    const res = await fetch("/api/products");
    const data = await res.json();
    setProducts(data);
  }, []);

  const loadCustomers = async () => {
    const res = await fetch("/api/customers");
    const data = await res.json();
    setCustomers(data);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount; state is set inside the async callback
    loadProducts();
    loadCustomers();
  }, [loadProducts]);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    (c.phone && c.phone.includes(customerSearch))
  );

  const addToCart = (product: Product) => {
    const existing = cart.find((item) => item.productId === product.id);

    if (product.stockQuantity <= 0) {
      alert(`⚠️ OUT OF STOCK!\n\n${product.name} is currently out of stock.`);
      return;
    }

    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert(`️ MAXIMUM QUANTITY REACHED!\n\nOnly ${product.stockQuantity} ${product.unitName || 'pcs'} available.`);
        return;
      }
      setCart(
        cart.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          unitPrice: parseFloat(product.price),
          quantity: 1,
          maxStock: product.stockQuantity,
          unitName: product.unitName,
          itemsPerUnit: product.itemsPerUnit,
        },
      ]);
    }
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart(
      cart
        .map((item) => {
          if (item.productId !== productId) return item;
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          if (newQty > item.maxStock) return item;
          return { ...item, quantity: newQty };
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter((item) => item.productId !== productId));
  };

  const total = cart.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setProcessing(true);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          customerName: selectedCustomer?.name || null,
          customerId: selectedCustomer?.id || null,
          userId: userId,
        }),
      });

      if (res.ok) {
        const sale = await res.json();
        setLastSale({ ...sale, items: cart, customerName: selectedCustomer?.name });
        setCart([]);
        setSelectedCustomer(null);
        setCustomerSearch("");
        setShowReceipt(true);
        loadProducts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setProcessing(false);
    }
  };

  const handlePrint = () => {
    // Small delay to ensure modal is rendered
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="flex gap-4 h-[calc(100vh-3rem)]">
      {/* Products Section */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white rounded-lg p-1 shadow">
              <img src="/logo.png" alt="IGMart" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">IGMART</h1>
              <p className="text-xs text-green-600 font-bold">VENTURES</p>
            </div>
          </div>
          <p className="text-gray-500">Point of Sale - Select products to add to cart</p>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search all products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === ""
                ? "bg-green-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id.toString())}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.id.toString()
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Product Grid - SMALLER CARDS */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-3 2xl:grid-cols-4 gap-3">
            {filteredProducts.map((product) => {
              const inCart = cart.find((i) => i.productId === product.id);
              const outOfStock = product.stockQuantity <= 0;

              return (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={outOfStock}
                  className={`text-left p-3 bg-white rounded-lg border-2 transition-all relative ${
                    outOfStock
                      ? "opacity-50 cursor-not-allowed bg-gray-50 border-gray-200"
                      : inCart
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-green-400"
                  }`}
                >
                  {inCart && (
                    <span className="absolute top-2 right-2 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold text-xs">
                      {inCart.quantity}
                    </span>
                  )}
                  <div className="mb-2">
                    <h3 className="font-semibold text-gray-900 text-sm truncate">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 truncate">{product.categoryName || "Uncategorized"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold text-green-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded ${
                        outOfStock
                          ? "bg-red-100 text-red-600"
                          : product.stockQuantity < 10
                          ? "bg-amber-100 text-amber-600"
                          : "bg-green-100 text-green-600"
                      }`}
                    >
                      {outOfStock ? "Out" : product.stockQuantity}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Cart Section - COMPACT */}
      <div className="w-96 bg-white rounded-lg shadow border border-gray-200 flex flex-col flex-shrink-0">
        <div className="p-3 border-b border-gray-200 bg-green-600 text-white rounded-t-lg">
          <h2 className="text-base font-bold flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Cart ({cart.length})
          </h2>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2" style={{maxHeight: 'calc(100vh - 22rem)'}}>
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="w-8 h-8" />
              </div>
              <p className="font-medium">Cart is empty</p>
              <p className="text-sm">Click products to add them</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="bg-gray-50 rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">{item.productName}</p>
                    <p className="text-[10px] text-gray-500">
                      ${item.unitPrice.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={item.maxStock}
                      value={editingQty[item.productId] !== undefined ? editingQty[item.productId] : item.quantity}
                      onChange={(e) => {
                        setEditingQty({...editingQty, [item.productId]: e.target.value});
                      }}
                      onBlur={(e) => {
                        const qty = parseInt(e.target.value);
                        if (qty > 0 && qty <= item.maxStock) {
                          setCart(cart.map(i => i.productId === item.productId ? {...i, quantity: qty} : i));
                        }
                        const newEditing = {...editingQty};
                        delete newEditing[item.productId];
                        setEditingQty(newEditing);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const qty = parseInt((e.target as HTMLInputElement).value);
                          if (qty > 0 && qty <= item.maxStock) {
                            setCart(cart.map(i => i.productId === item.productId ? {...i, quantity: qty} : i));
                          }
                          const newEditing = {...editingQty};
                          delete newEditing[item.productId];
                          setEditingQty(newEditing);
                          (e.target as HTMLInputElement).blur();
                        }
                      }}
                      className="w-10 text-center font-bold text-xs bg-white border border-gray-300 rounded py-0.5 focus:ring-2 focus:ring-green-500 outline-none"
                    />
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center hover:bg-gray-300"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-red-500 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="font-bold text-gray-900 text-sm">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Section - COMPACT */}
        <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50 rounded-b-lg">
          {/* Customer */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Customer</label>
            <div className="relative">
              <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setShowCustomerDropdown(true);
                }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full pl-8 pr-6 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none"
              />
              {selectedCustomer && (
                <button
                  onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Payment */}
          <div>
            <label className="block text-[10px] font-medium text-gray-500 uppercase mb-1">Payment</label>
            <div className="grid grid-cols-3 gap-1">
              <button onClick={() => setPaymentMethod("cash")} className={`py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-0.5 ${paymentMethod === "cash" ? "bg-green-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
                <Banknote className="w-3 h-3" /> Cash
              </button>
              <button onClick={() => setPaymentMethod("momo")} className={`py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-0.5 ${paymentMethod === "momo" ? "bg-purple-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
                <Smartphone className="w-3 h-3" /> MoMo
              </button>
              <button onClick={() => setPaymentMethod("card")} className={`py-1.5 rounded text-[10px] font-medium flex items-center justify-center gap-0.5 ${paymentMethod === "card" ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300"}`}>
                <CreditCard className="w-3 h-3" /> Card
              </button>
            </div>
          </div>

          {/* Total */}
          <div className="bg-white rounded-lg p-2 border border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-600">Total:</span>
              <span className="text-xl font-bold text-green-600">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Complete Sale */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || processing}
            className="w-full py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-1.5 text-sm"
          >
            {processing ? (
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" /> Complete
              </>
            )}
          </button>
        </div>
      </div>

      {/* Receipt Modal - COMPACT */}
      {showReceipt && lastSale && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            {/* Header with Close Button */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 text-center relative">
              <button
                onClick={() => setShowReceipt(false)}
                className="absolute top-3 right-3 p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
              <CheckCircle className="w-10 h-10 mx-auto mb-2" />
              <h2 className="text-lg font-bold">Payment Successful!</h2>
              <p className="text-xs text-green-100">{lastSale.saleNumber}</p>
            </div>
            
              {/* Receipt Content - for Printing */}
            <div className="receipt-wrapper">
              <div className="p-4" id="receipt-content">
              {/* Header with Logo */}
              <div className="text-center mb-3 pb-2 border-b border-dashed border-gray-300">
                <div className="w-12 h-12 mx-auto mb-2">
                  <img src="/logo.png" alt="IGMart" className="w-full h-full object-contain" />
                </div>
                <h3 className="text-lg font-black text-gray-900">IGMART</h3>
                <p className="text-[10px] text-green-600 font-bold">VENTURES</p>
                <p className="text-[9px] text-gray-500 mt-1">{new Date(lastSale.createdAt).toLocaleString()}</p>
              </div>
              
              {/* Items - Compact */}
              <div className="space-y-1.5 mb-3">
                {lastSale.items.map((item: any, i: number) => (
                  <div key={i} className="flex justify-between text-xs">
                    <span className="text-gray-700">{item.productName} x{item.quantity}</span>
                    <span className="font-medium text-gray-900">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="border-t border-dashed border-gray-300 pt-2 mb-2">
                <div className="flex justify-between">
                  <span className="text-xs text-gray-600">TOTAL:</span>
                  <span className="text-lg font-bold text-green-600">${lastSale.totalAmount}</span>
                </div>
              </div>
              
              {/* Payment Info */}
              <div className="text-[10px] text-gray-500 space-y-0.5">
                <p>Payment: <span className="font-medium capitalize">{lastSale.paymentMethod}</span></p>
                {lastSale.customerName && <p>Customer: <span className="font-medium">{lastSale.customerName}</span></p>}
              </div>
              
              {/* Thank you */}
              <p className="text-[10px] text-center text-gray-400 mt-3 pt-2 border-t border-dashed">Thank you!</p>
            </div>
            </div>
            
            {/* Action Buttons - Hide when printing */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 space-y-2 no-print">
              <button
                onClick={handlePrint}
                className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 text-sm"
              >
                🖨️ Print Receipt
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="w-full bg-white border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
