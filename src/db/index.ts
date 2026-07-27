import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

/**
 * Build the connection pool from DATABASE_URL. We intentionally do NOT throw
 * here when the variable is missing: `new Pool()` only fails later, when a
 * query actually connects. That keeps `next build` working (it imports this
 * module to collect route metadata) and surfaces a clear connection error at
 * runtime instead of crashing the build.
 */
const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool, { schema });
