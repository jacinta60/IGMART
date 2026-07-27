import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Reads DATABASE_URL from your .env so `npm run db:migrate` / `db:push` /
// `db:studio` target the same database the app uses (e.g. Supabase), instead
// of a hardcoded localhost URL.
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
