import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, products, expenses, users } from "@/db/schema";
import { sql, gte, lte, desc, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const reportType = searchParams.get("type") || "daily";

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Sales in period
    const salesQuery = db
      .select({
        totalSales: sql<string>`coalesce(sum(${sales.totalAmount}), 0)::text`,
        totalDiscount: sql<string>`coalesce(sum(${sales.discount}), 0)::text`,
        transactionCount: sql<number>`count(*)::int`,
      })
      .from(sales)
      .where(sql`${sales.createdAt} BETWEEN ${start} AND ${end}`);

    // Expenses in period
    const expensesQuery = db
      .select({
        totalExpenses: sql<string>`coalesce(sum(${expenses.amount}), 0)::text`,
      })
      .from(expenses)
      .where(sql`${expenses.date} BETWEEN ${start} AND ${end}`);

    // Sales by cashier
    const salesByCashier = await db
      .select({
        cashierName: users.fullName,
        totalSales: sql<string>`coalesce(sum(${sales.totalAmount}), 0)::text`,
        transactionCount: sql<number>`count(*)::int`,
      })
      .from(sales)
      .leftJoin(users, sql`${sales.userId} = ${users.id}`)
      .where(sql`${sales.createdAt} BETWEEN ${start} AND ${end}`)
      .groupBy(users.id, users.fullName)
      .orderBy(desc(sql`coalesce(sum(${sales.totalAmount}), 0)`));

    // Best selling products
    const bestSelling = await db
      .select({
        productName: saleItems.productName,
        totalQty: sql<number>`sum(${saleItems.quantity})::int`,
        totalRevenue: sql<string>`sum(${saleItems.subtotal})::text`,
      })
      .from(saleItems)
      .leftJoin(sales, eq(saleItems.saleId, sales.id))
      .where(sql`${sales.createdAt} BETWEEN ${start} AND ${end}`)
      .groupBy(saleItems.productName)
      .orderBy(desc(sql`sum(${saleItems.quantity})`))
      .limit(10);

    // Profit calculation (simplified: sales - cost of goods)
    const profitData = await db
      .select({
        totalRevenue: sql<string>`coalesce(sum(${saleItems.subtotal}), 0)::text`,
        totalCost: sql<string>`coalesce(sum(${saleItems.quantity}::numeric * ${products.costPrice}::numeric), 0)::text`,
      })
      .from(saleItems)
      .leftJoin(products, eq(saleItems.productId, products.id))
      .leftJoin(sales, eq(saleItems.saleId, sales.id))
      .where(sql`${sales.createdAt} BETWEEN ${start} AND ${end}`);

    const [salesData] = await salesQuery;
    const [expensesData] = await expensesQuery;
    const [profit] = profitData;

    const grossProfit = parseFloat(profit?.totalRevenue || "0") - parseFloat(profit?.totalCost || "0");
    const netProfit = grossProfit - parseFloat(expensesData?.totalExpenses || "0");

    return NextResponse.json({
      period: { start: start.toISOString(), end: end.toISOString() },
      summary: {
        totalSales: salesData?.totalSales || "0",
        totalDiscount: salesData?.totalDiscount || "0",
        totalExpenses: expensesData?.totalExpenses || "0",
        grossProfit: String(grossProfit.toFixed(2)),
        netProfit: String(netProfit.toFixed(2)),
        transactionCount: salesData?.transactionCount || 0,
      },
      salesByCashier,
      bestSellingProducts: bestSelling,
      profitData: {
        revenue: profit?.totalRevenue || "0",
        costOfGoods: profit?.totalCost || "0",
        grossProfit: String(grossProfit.toFixed(2)),
        expenses: expensesData?.totalExpenses || "0",
        netProfit: String(netProfit.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate reports" }, { status: 500 });
  }
}
