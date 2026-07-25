import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { customers } from "@/db/schema";
import { desc, ilike } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    let query = db.select().from(customers).orderBy(desc(customers.createdAt)).$dynamic();

    if (search) {
      query = query.where(ilike(customers.name, `%${search}%`));
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, email } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [customer] = await db
      .insert(customers)
      .values({
        name: name.trim(),
        phone: phone?.trim() || null,
        email: email?.trim() || null,
      })
      .returning();

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}
