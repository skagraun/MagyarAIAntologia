"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { inviteCodes } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { str, int } from "./form";
import type { ActionState } from "./types";

const INVITES_PATH = "/admin/meghivok";

/** Olvasható, nehezen kitalálható meghívókód: MAI-XXXX-XXXX (kétértelmű karakterek nélkül). */
function generateCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  let out = "";
  for (let i = 0; i < 8; i++) {
    out += alphabet[bytes[i] % alphabet.length];
    if (i === 3) out += "-";
  }
  return `MAI-${out}`;
}

export async function createInvite(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const email = str(formData, "email")?.toLowerCase() ?? null;
  const expiresInDays = int(formData, "expiresInDays");
  const expiresAt =
    expiresInDays && expiresInDays > 0
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

  await db.insert(inviteCodes).values({
    code: generateCode(),
    email,
    expiresAt,
    createdByUserId: admin.id,
  });

  revalidatePath(INVITES_PATH);
  return { ok: true };
}

export async function deleteInvite(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = str(formData, "id");
  if (id) {
    await db.delete(inviteCodes).where(eq(inviteCodes.id, id));
    revalidatePath(INVITES_PATH);
  }
}
