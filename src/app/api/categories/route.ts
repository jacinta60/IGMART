import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { eq, sql, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db
      .select({
        id: categories.id,
        name: categories.name,
        description: categories.description,
        createdAt: categories.createdAt,
        productCount: sql<number>`(
          SELECT count(*)::int FROM products WHERE products.category_id = ${categories.id}
        )`,
      })
      .from(categories)
      .orderBy(desc(categories.createdAt));

    return NextResponse.json(result);
  } catch (error) {
    console.error("Get categories error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [category] = await db
      .insert(categories)
      .values({ name: name.trim(), description: description?.trim() || null })
      .returning();

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Create category error:", error);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}
