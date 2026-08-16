import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  // `organization_members.user_id` references Supabase's `auth.users`
  // (via drizzle-orm/supabase's `authUsers`), which we don't manage here.
  schemaFilter: ["public"],
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});