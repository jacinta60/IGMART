import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

const databaseUrl = process.env.DATABASE_URL;

// Build the connection pool from DATABASE_URL. We don't throw when the
// variable is missing (pg only fails later, on connect), which keeps
// `next build` working and surfaces a clear connection error at runtime.
//
// TLS on managed Postgres (Supabase, etc.): pg v9 treats sslmode=require as
// verify-full, which rejects Supabase's certificate chain in runtimes like
// Vercel ("self-signed certificate in certificate chain"). For non-local
// connections we request libpq-compatible TLS via `uselibpqcompat` (encrypt
// without CA verification) and also set ssl.rejectUnauthorized = false as a
// belt-and-suspenders measure. Local dev connections stay non-TLS.
const isLocal =
  !databaseUrl ||
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1");

function buildConnectionString(url: string): string {
  if (isLocal) return url;
  try {
    const u = new URL(url);
    u.searchParams.set("uselibpqcompat", "true");
    return u.toString();
  } catch {
    return url;
  }
}

const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl ? buildConnectionString(databaseUrl) : databaseUrl,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
