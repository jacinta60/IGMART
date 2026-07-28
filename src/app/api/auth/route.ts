import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, isBcryptHash, verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.username, username));

    if (!user || !(await verifyPassword(password, user.password))) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Transparent upgrade: if the stored password is still plaintext from
    // before we introduced hashing, hash it now that we know it's correct.
    if (!isBcryptHash(user.password)) {
      const hashed = await hashPassword(password);
      await db.update(users).set({ password: hashed }).where(eq(users.id, user.id));
    }

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName }
    });

    // Session cookie. We keep httpOnly=false for now because the client
    // sidebar reads the role from it; making it httpOnly is a follow-up
    // that also requires a /api/auth/me endpoint. See TODO in README.
    response.cookies.set("auth_token", JSON.stringify({
      id: user.id,
      role: user.role,
      name: user.fullName
    }), {
      httpOnly: false,
      path: "/",
      sameSite: "lax",
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
