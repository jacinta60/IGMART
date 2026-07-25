"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Receipt,
  Store,
  Users,
  LogOut,
  ChevronRight,
  Truck,
  TrendingUp,
  Wallet,
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);

  useEffect(() => {
    const cookie = document.cookie.split("; ").find((row) => row.startsWith("auth_token="));
    if (cookie) {
      try {
        const userData = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
        setUser(userData);
      } catch (e) {}
    }
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth", { method: "DELETE" });
    window.location.href = "/login";
  };

  const isAdmin = user?.role === "admin";

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard, show: true },
    { href: "/pos", label: "Point of Sale", icon: ShoppingCart, show: true },
    { href: "/products", label: "Inventory", icon: Package, show: true },
    { href: "/suppliers", label: "Suppliers", icon: Truck, show: isAdmin },
    { href: "/customers", label: "Customers", icon: Users, show: true },
    { href: "/purchases", label: "Purchases", icon: Store, show: isAdmin },
    { href: "/expenses", label: "Expenses", icon: Wallet, show: isAdmin },
    { href: "/reports", label: "Reports", icon: TrendingUp, show: true },
    { href: "/sales", label: "Sales History", icon: Receipt, show: true },
    { href: "/employees", label: "Employees", icon: Users, show: isAdmin },
  ];

  if (!user) return null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col z-30">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 border border-gray-100">
            <img src="/logo.png" alt="IGMart" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">IGMART</h1>
            <p className="text-xs text-green-600 font-semibold">VENTURES</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-3 space-y-1">
        {navItems.filter(item => item.show).map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-4 h-4" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
              {user.name?.[0] || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 uppercase">{user.role}</p>
            </div>
          </div>
        </div>
        <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-100">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </aside>
  );
}
