import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || user.password !== password) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName }
    });

    // Set a simple cookie for "session"
    response.cookies.set("auth_token", JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.fullName
    }), {
      httpOnly: false, // Access from client for simplicity in this demo
      path: "/",
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json({ error: "Login failed", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("auth_token");
  return response;
}
