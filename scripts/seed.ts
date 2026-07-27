import "dotenv/config";
import { db } from "../src/db";
import { categories, products, units, users } from "../src/db/schema";
import { sql } from "drizzle-orm";

/**
 * Bootstraps a fresh database with demo data so you can log in immediately.
 * Run with: npm run db:seed
 *
 * This mirrors the logic in src/app/api/seed/route.ts but runs directly
 * against the database (no auth required), which is necessary on a brand-new
 * install where no user exists yet to authenticate with.
 */
async function main() {
  console.log("Seeding database (this truncates existing demo tables)...");

  await db.execute(
    sql`TRUNCATE TABLE sale_items, sales, products, categories, units, users CASCADE`
  );

  await db.insert(users).values([
    { username: "admin", password: "admin", fullName: "Admin Manager", role: "admin" },
    { username: "staff", password: "staff", fullName: "Sales Staff", role: "employee" },
  ]);

  const [pcs] = await db.insert(units).values({ name: "Pieces", shortName: "pcs" }).returning();
  const [box] = await db.insert(units).values({ name: "Box", shortName: "box" }).returning();
  const [carton] = await db.insert(units).values({ name: "Carton", shortName: "ctn" }).returning();
  const [pack] = await db.insert(units).values({ name: "Pack", shortName: "pk" }).returning();

  const [dairy] = await db.insert(categories).values({ name: "Dairy", description: "Milk and eggs" }).returning();
  const [snacks] = await db.insert(categories).values({ name: "Snacks", description: "Chips and cookies" }).returning();

  const futureDate = new Date();
  futureDate.setMonth(futureDate.getMonth() + 6);

  await db.insert(products).values([
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
  ]);

  console.log("Seed complete.");
  console.log("  Users created: admin / admin  and  staff / staff");
  console.log("  Categories, units and sample products also added.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
