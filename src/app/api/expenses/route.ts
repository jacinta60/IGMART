import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { expenses } from "@/db/schema";
import { desc, gte, lte, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    let query = db
      .select({
        id: expenses.id,
        category: expenses.category,
        description: expenses.description,
        amount: expenses.amount,
        date: expenses.date,
        paidBy: expenses.paidBy,
        receipt: expenses.receipt,
        createdAt: expenses.createdAt,
      })
      .from(expenses)
      .orderBy(desc(expenses.date))
      .$dynamic();

    if (startDate && endDate) {
      query = query.where(
        sql`${expenses.date} BETWEEN ${new Date(startDate)} AND ${new Date(endDate)}`
      );
    }

    const result = await query;
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, description, amount, date, paidBy, receipt } = body;

    if (!category || !amount) {
      return NextResponse.json({ error: "Category and amount are required" }, { status: 400 });
    }

    const [expense] = await db
      .insert(expenses)
      .values({
        category,
        description: description?.trim() || null,
        amount: String(amount),
        date: date ? new Date(date) : new Date(),
        paidBy: paidBy?.trim() || null,
        receipt: receipt?.trim() || null,
      })
      .returning();

    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
  }
}
