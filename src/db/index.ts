import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type DB = ReturnType<typeof drizzle<typeof schema>>;

let cached: DB | null = null;

/**
 * Lusta inicializálás: a kapcsolat (és a DATABASE_URL ellenőrzése) csak az első
 * tényleges használatkor történik, nem a modul importálásakor. Így a Next.js
 * build (page data gyűjtés) nem dől el akkor sem, ha a DATABASE_URL build-időben
 * nincs beállítva — a hiba a tényleges lekérdezésnél jelentkezik, ahol kell.
 */
function getDb(): DB {
  if (cached) return cached;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "Hiányzik a DATABASE_URL környezeti változó. Lokálisan másold le a .env.example fájlt .env.local néven, Vercelen pedig állítsd be a projekt env változói között.",
    );
  }
  cached = drizzle(neon(databaseUrl), { schema });
  return cached;
}

/** A Drizzle adatbázis-kliens. Az elérése váltja ki a lusta inicializálást. */
export const db = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === "function" ? value.bind(real) : value;
  },
}) as DB;

export { schema };
