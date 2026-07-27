import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
  __arenaNextJsDrizzle?: NodePgDatabase<typeof schema>;
};

function createPool(): Pool {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is required to connect to PostgreSQL. Set it in your environment or .env file."
    );
  }
  return new Pool({ connectionString: databaseUrl });
}

/**
 * Returns the shared connection pool, creating it on first use. This is lazy on
 * purpose: importing `@/db` must not require DATABASE_URL (e.g. during
 * `next build` or cold starts). The error only fires once a real query runs.
 */
export function getPool(): Pool {
  if (!globalForDb.__arenaNextJsPostgresqlPool) {
    globalForDb.__arenaNextJsPostgresqlPool = createPool();
  }
  return globalForDb.__arenaNextJsPostgresqlPool;
}

function getDb(): NodePgDatabase<typeof schema> {
  if (!globalForDb.__arenaNextJsDrizzle) {
    globalForDb.__arenaNextJsDrizzle = drizzle(getPool(), { schema });
  }
  return globalForDb.__arenaNextJsDrizzle;
}

/**
 * Lazy drizzle instance. Property access (e.g. `db.select`) resolves the real
 * instance on first use, so this module can be imported without a database.
 */
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    return Reflect.get(
      getDb(),
      prop as keyof NodePgDatabase<typeof schema>,
      receiver
    );
  },
}) as NodePgDatabase<typeof schema>;
