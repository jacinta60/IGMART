import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)));

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      price,
      costPrice,
      stockQuantity,
      itemsPerUnit,
      expiryDate,
      barcode,
      unitId,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [updated] = await db
      .update(products)
      .set({
        name: name.trim(),
        description: description?.trim() || null,
        categoryId: categoryId ? parseInt(categoryId) : null,
        price: String(price),
        costPrice: String(costPrice || 0),
        stockQuantity: parseInt(stockQuantity) || 0,
        itemsPerUnit: parseInt(itemsPerUnit) || 1,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        barcode: barcode?.trim() || null,
        unitId: unitId ? parseInt(unitId) : null,
        updatedAt: new Date(),
      })
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update product error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [deleted] = await db
      .delete(products)
      .where(eq(products.id, parseInt(id)))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete product error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
