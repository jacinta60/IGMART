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
// TLS: Supabase (and most managed Postgres) present a certificate that strict
// verification (pg's "require" -> "verify-full" in pg v9) rejects in some
// runtimes such as Vercel, causing "self-signed certificate in certificate
// chain". For any non-local connection we keep encryption but skip CA-chain
// verification. Local dev connections don't use TLS.
const isLocal =
  !databaseUrl ||
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1");

const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
