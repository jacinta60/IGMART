import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { purchases, purchaseItems, products, suppliers } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select({
        id: purchases.id,
        purchaseNumber: purchases.purchaseNumber,
        supplierId: purchases.supplierId,
        supplierName: suppliers.name,
        totalAmount: purchases.totalAmount,
        paymentStatus: purchases.paymentStatus,
        purchaseDate: purchases.purchaseDate,
        createdAt: purchases.createdAt,
        itemCount: sql<number>`(
          SELECT count(*)::int FROM purchase_items WHERE purchase_items.purchase_id = ${purchases.id}
        )`,
      })
      .from(purchases)
      .leftJoin(suppliers, eq(purchases.supplierId, suppliers.id))
      .orderBy(desc(purchases.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get purchases error:", error);
    return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplierId, items, paymentStatus } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "At least one item is required" }, { status: 400 });
    }

    const purchaseNumber = `PO-${Date.now()}`;
    let totalAmount = 0;

    for (const item of items) {
      totalAmount += item.quantity * item.costPrice;
    }

    const [purchase] = await db
      .insert(purchases)
      .values({
        purchaseNumber,
        supplierId: supplierId ? parseInt(supplierId) : null,
        totalAmount: String(totalAmount.toFixed(2)),
        paymentStatus: paymentStatus || "pending",
      })
      .returning();

    for (const item of items) {
      const subtotal = item.quantity * item.costPrice;

      await db.insert(purchaseItems).values({
        purchaseId: purchase.id,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        costPrice: String(item.costPrice),
        subtotal: String(subtotal.toFixed(2)),
      });

      // Increase stock
      if (item.productId) {
        await db
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
            costPrice: String(item.costPrice),
          })
          .where(eq(products.id, item.productId));
      }
    }

    return NextResponse.json(purchase, { status: 201 });
  } catch (error) {
    console.error("Create purchase error:", error);
    return NextResponse.json({ error: "Failed to create purchase" }, { status: 500 });
  }
}
