import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { units } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(units).orderBy(desc(units.id));
    return NextResponse.json(result);
  } catch (error) {
    console.error("Get units error:", error);
    return NextResponse.json({ error: "Failed to fetch units" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, shortName } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const [unit] = await db
      .insert(units)
      .values({ name: name.trim(), shortName: shortName?.trim() || null })
      .returning();

    return NextResponse.json(unit, { status: 201 });
  } catch (error) {
    console.error("Create unit error:", error);
    return NextResponse.json({ error: "Failed to create unit" }, { status: 500 });
  }
}
