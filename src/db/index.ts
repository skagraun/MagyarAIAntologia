import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Hiányzik a DATABASE_URL környezeti változó. Másold le a .env.example fájlt .env.local néven és töltsd ki.",
  );
}

const sql = neon(databaseUrl);

export const db = drizzle(sql, { schema });

export { schema };
