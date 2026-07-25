import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sales, saleItems } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [sale] = await db
      .select()
      .from(sales)
      .where(eq(sales.id, parseInt(id)));

    if (!sale) {
      return NextResponse.json({ error: "Sale not found" }, { status: 404 });
    }

    const items = await db
      .select()
      .from(saleItems)
      .where(eq(saleItems.saleId, parseInt(id)));

    return NextResponse.json({ ...sale, items });
  } catch (error) {
    console.error("Get sale error:", error);
    return NextResponse.json({ error: "Failed to fetch sale" }, { status: 500 });
  }
}
