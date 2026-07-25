import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, sales, saleItems, categories } from "@/db/schema";
import { sql, gte, desc } from "drizzle-orm";

export async function GET() {
  try {
    // Total products
    const [productCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products);

    // Total categories
    const [categoryCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories);

    // Today's sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [todaySales] = await db
      .select({
        count: sql<number>`count(*)::int`,
        total: sql<string>`coalesce(sum(total_amount::numeric), 0)::text`,
      })
      .from(sales)
      .where(gte(sales.createdAt, today));

    // Total revenue (all time)
    const [totalRevenue] = await db
      .select({
        total: sql<string>`coalesce(sum(total_amount::numeric), 0)::text`,
      })
      .from(sales);

    // Low stock products
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(sql`${products.stockQuantity} < 10`)
      .orderBy(products.stockQuantity)
      .limit(10);

    // Expiring products (next 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    const expiringProducts = await db
      .select()
      .from(products)
      .where(sql`${products.expiryDate} IS NOT NULL AND ${products.expiryDate} < ${thirtyDaysFromNow}`)
      .orderBy(products.expiryDate)
      .limit(10);

    // Recent sales
    const recentSales = await db
      .select()
      .from(sales)
      .orderBy(desc(sales.createdAt))
      .limit(5);

    // Sales last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailySales = await db
      .select({
        date: sql<string>`to_char(created_at, 'YYYY-MM-DD')`,
        total: sql<string>`coalesce(sum(total_amount::numeric), 0)::text`,
        count: sql<number>`count(*)::int`,
      })
      .from(sales)
      .where(gte(sales.createdAt, sevenDaysAgo))
      .groupBy(sql`to_char(created_at, 'YYYY-MM-DD')`)
      .orderBy(sql`to_char(created_at, 'YYYY-MM-DD')`);

    // Top selling products
    const topProducts = await db
      .select({
        productName: saleItems.productName,
        totalQty: sql<number>`sum(${saleItems.quantity})::int`,
        totalRevenue: sql<string>`sum(${saleItems.subtotal}::numeric)::text`,
      })
      .from(saleItems)
      .groupBy(saleItems.productName)
      .orderBy(sql`sum(${saleItems.quantity}) desc`)
      .limit(5);

    return NextResponse.json({
      productCount: productCount.count,
      categoryCount: categoryCount.count,
      todaySalesCount: todaySales.count,
      todaySalesTotal: todaySales.total,
      totalRevenue: totalRevenue.total,
      lowStockProducts,
      expiringProducts,
      recentSales,
      dailySales,
      topProducts,
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to load dashboard data" },
      { status: 500 }
    );
  }
}
