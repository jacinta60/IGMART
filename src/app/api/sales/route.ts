import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems, products, users, customers } from "@/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    
    let query = db
      .select({
        id: sales.id,
        saleNumber: sales.saleNumber,
        totalAmount: sales.totalAmount,
        paymentMethod: sales.paymentMethod,
        customerName: sales.customerName,
        userId: sales.userId,
        userName: users.fullName,
        createdAt: sales.createdAt,
        itemCount: sql<number>`(
          SELECT count(*)::int FROM sale_items WHERE sale_items.sale_id = ${sales.id}
        )`,
      })
      .from(sales)
      .leftJoin(users, eq(sales.userId, users.id))
      .orderBy(desc(sales.createdAt))
      .$dynamic();

    // Filter by specific user if provided (for staff to see only their sales)
    if (userId) {
      query = query.where(eq(sales.userId, parseInt(userId)));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get sales error:", error);
    return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { items, paymentMethod, customerName, customerId, userId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const saleNumber = `SALE-${Date.now()}`;
    let totalAmount = 0;

    for (const item of items) {
      totalAmount += item.quantity * item.unitPrice;
    }

    const [sale] = await db
      .insert(sales)
      .values({
        saleNumber,
        totalAmount: String(totalAmount.toFixed(2)),
        paymentMethod: paymentMethod || "cash",
        customerName: customerName?.trim() || null,
        customerId: customerId ? parseInt(customerId) : null,
        userId: userId ? parseInt(userId) : null,
      })
      .returning();

    for (const item of items) {
      const subtotal = item.quantity * item.unitPrice;

      await db.insert(saleItems).values({
        saleId: sale.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: String(item.unitPrice),
        subtotal: String(subtotal.toFixed(2)),
      });

      if (item.productId) {
        await db
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
          })
          .where(eq(products.id, item.productId));
      }
    }

    // Update customer loyalty points and total purchases
    if (customerId) {
      await db
        .update(customers)
        .set({
          loyaltyPoints: sql`${customers.loyaltyPoints} + ${Math.floor(totalAmount)}`,
          totalPurchases: sql`${customers.totalPurchases}::numeric + ${totalAmount}::numeric`,
        })
        .where(eq(customers.id, parseInt(customerId)));
    }

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    console.error("Create sale error:", error);
    return NextResponse.json({ error: "Failed to create sale" }, { status: 500 });
  }
}
