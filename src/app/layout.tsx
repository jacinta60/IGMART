import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "IGMART VENTURES - Supermarket Management",
  description: "IGMART VENTURES - Quality Products | Great Prices | Trusted Service",
};

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("auth_token");
  
  // Basic path check to avoid infinite redirect
  // Note: This is a simplified check. In a real app, use Middleware.
  
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {authCookie && <Sidebar />}
        <main className={`${authCookie ? 'ml-64' : ''} p-8 overflow-auto`}>
          {children}
        </main>
      </body>
    </html>
  );
}
