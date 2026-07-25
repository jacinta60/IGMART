import { NextResponse } from "next/server";
import { db } from "@/db";
import { categories, products, sales, saleItems, units, users } from "@/db/schema";
import { sql } from "drizzle-orm";

export async function POST() {
  try {
    // Clear data for fresh start (optional but good for this request)
    await db.execute(sql`TRUNCATE TABLE sale_items, sales, products, categories, units, users CASCADE`);

    // Seed Users
    await db.insert(users).values([
      { username: "admin", password: "admin", fullName: "Admin Manager", role: "admin" },
      { username: "staff", password: "staff", fullName: "Sales Staff", role: "employee" },
    ]);

    // Seed Units
    const [pcs] = await db.insert(units).values({ name: "Pieces", shortName: "pcs" }).returning();
    const [box] = await db.insert(units).values({ name: "Box", shortName: "box" }).returning();
    const [carton] = await db.insert(units).values({ name: "Carton", shortName: "ctn" }).returning();
    const [pack] = await db.insert(units).values({ name: "Pack", shortName: "pk" }).returning();

    // Seed categories
    const [dairy] = await db.insert(categories).values({ name: "Dairy", description: "Milk and eggs" }).returning();
    const [snacks] = await db.insert(categories).values({ name: "Snacks", description: "Chips and cookies" }).returning();

    // Seed products with Expiry and ItemsPerUnit
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 6);

    const productData = [
      {
        name: "Whole Milk Box",
        categoryId: dairy.id,
        price: "15.00",
        costPrice: "10.00",
        stockQuantity: 20,
        itemsPerUnit: 12,
        expiryDate: futureDate,
        barcode: "M001",
        unitId: box.id,
      },
      {
        name: "Chocolate Pack",
        categoryId: snacks.id,
        price: "12.50",
        costPrice: "8.00",
        stockQuantity: 50,
        itemsPerUnit: 24,
        expiryDate: futureDate,
        barcode: "C001",
        unitId: pack.id,
      },
      {
        name: "Soda Carton",
        categoryId: snacks.id,
        price: "24.00",
        costPrice: "18.00",
        stockQuantity: 15,
        itemsPerUnit: 24,
        expiryDate: futureDate,
        barcode: "S001",
        unitId: carton.id,
      },
    ];

    await db.insert(products).values(productData);

    return NextResponse.json({ message: "Seed data created successfully" }, { status: 201 });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
