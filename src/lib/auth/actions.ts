"use server";

import { redirect } from "next/navigation";
import { and, eq, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { users, inviteCodes } from "@/db/schema";
import { hashPassword, verifyPassword } from "./password";
import { createSession, destroySession } from "./session";
import type { ActionState } from "@/lib/actions/types";

// ---------------------------------------------------------------------------
// Bejelentkezés
// ---------------------------------------------------------------------------

const loginSchema = z.object({
  email: z.string().email("Érvénytelen email cím."),
  password: z.string().min(1, "Add meg a jelszót."),
});

export async function login(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();

  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { ok: false, error: "Hibás email cím vagy jelszó." };
  }

  await createSession(user.id);
  redirect("/");
}

// ---------------------------------------------------------------------------
// Regisztráció (zárt, meghívókóddal)
// ---------------------------------------------------------------------------

const registerSchema = z.object({
  name: z.string().min(2, "Add meg a neved (min. 2 karakter)."),
  email: z.string().email("Érvénytelen email cím."),
  password: z.string().min(8, "A jelszó legyen legalább 8 karakter."),
  inviteCode: z.string().min(1, "Add meg a meghívókódot."),
});

export async function register(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    inviteCode: formData.get("inviteCode"),
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const email = parsed.data.email.toLowerCase().trim();
  const code = parsed.data.inviteCode.trim();

  // Email foglaltság ellenőrzése
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (existing) {
    return { ok: false, error: "Ezzel az email címmel már létezik fiók." };
  }

  // Első felhasználó? -> admin, bootstrap kóddal
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(users);
  const isFirstUser = count === 0;

  if (isFirstUser) {
    const bootstrap = process.env.BOOTSTRAP_INVITE_CODE;
    if (!bootstrap || code !== bootstrap) {
      return {
        ok: false,
        error:
          "Az első fiók létrehozásához a BOOTSTRAP_INVITE_CODE szükséges (lásd .env).",
      };
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        name: parsed.data.name.trim(),
        role: "admin",
      })
      .returning({ id: users.id });

    await createSession(created.id);
    redirect("/");
  }

  // Nem első felhasználó -> érvényes, fel nem használt db meghívókód kell
  const [invite] = await db
    .select()
    .from(inviteCodes)
    .where(and(eq(inviteCodes.code, code), isNull(inviteCodes.usedByUserId)))
    .limit(1);

  if (!invite) {
    return { ok: false, error: "Érvénytelen vagy már felhasznált meghívókód." };
  }
  if (invite.expiresAt && invite.expiresAt.getTime() < Date.now()) {
    return { ok: false, error: "A meghívókód lejárt." };
  }
  if (invite.email && invite.email.toLowerCase() !== email) {
    return {
      ok: false,
      error: "Ez a meghívókód egy másik email címhez tartozik.",
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);

  const [created] = await db
    .insert(users)
    .values({
      email,
      passwordHash,
      name: parsed.data.name.trim(),
      role: "editor",
    })
    .returning({ id: users.id });

  // Atomi lefoglalás: csak akkor sikerül, ha a meghívó még felhasználatlan.
  // Ez véd a versenyhelyzet ellen (két egyidejű regisztráció ugyanazzal a kóddal).
  const claimed = await db
    .update(inviteCodes)
    .set({ usedByUserId: created.id, usedAt: new Date() })
    .where(and(eq(inviteCodes.id, invite.id), isNull(inviteCodes.usedByUserId)))
    .returning({ id: inviteCodes.id });

  if (claimed.length === 0) {
    // A meghívót időközben más felhasználta -> visszagörgetjük az új fiókot.
    await db.delete(users).where(eq(users.id, created.id));
    return { ok: false, error: "A meghívókódot időközben felhasználták." };
  }

  await createSession(created.id);
  redirect("/");
}

// ---------------------------------------------------------------------------
// Kijelentkezés
// ---------------------------------------------------------------------------

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}
