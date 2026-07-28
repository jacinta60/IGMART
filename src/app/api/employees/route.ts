import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";
import { hashPassword } from "@/lib/password";

export async function GET() {
  try {
    const result = await db.select({
      id: users.id,
      username: users.username,
      fullName: users.fullName,
      role: users.role,
      createdAt: users.createdAt
    }).from(users).orderBy(desc(users.id));
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password, fullName, role } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const hashed = await hashPassword(password);

    const [user] = await db
      .insert(users)
      .values({ username, password: hashed, fullName, role: role || "employee" })
      .returning({
        id: users.id,
        username: users.username,
        fullName: users.fullName,
        role: users.role,
        createdAt: users.createdAt,
      });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Username already exists" }, { status: 400 });
  }
}
