import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { products, categories, units } from "@/db/schema";
import { eq, desc, ilike, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const categoryId = searchParams.get("categoryId");

    let query = db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        categoryId: products.categoryId,
        categoryName: categories.name,
        price: products.price,
        costPrice: products.costPrice,
        stockQuantity: products.stockQuantity,
        itemsPerUnit: products.itemsPerUnit,
        expiryDate: products.expiryDate,
        barcode: products.barcode,
        unitId: products.unitId,
        unitName: units.name,
        unitShort: units.shortName,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(units, eq(products.unitId, units.id))
      .orderBy(desc(products.createdAt))
      .$dynamic();

    if (search) {
      query = query.where(ilike(products.name, `%${search}%`));
    }

    if (categoryId) {
      query = query.where(eq(products.categoryId, parseInt(categoryId)));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get products error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const [product] = await db
      .insert(products)
      .values({
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
      })
      .returning();

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Create product error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}
