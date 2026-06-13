import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// Több helyről is betöltjük (a Vercel CLI alapból .env.development.local-ba húz).
// A dotenv nem írja felül a már beállított kulcsokat, így az első találat nyer.
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
