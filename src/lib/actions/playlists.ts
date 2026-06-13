"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { playlists } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { str, int } from "./form";
import type { ActionState } from "./types";

const PLAYLISTS_PATH = "/listak";

export async function savePlaylist(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = str(formData, "id");
  const name = str(formData, "name");
  if (!name) {
    return { ok: false, fieldErrors: { name: ["A lista neve kötelező."] } };
  }

  const values = {
    emoji: str(formData, "emoji"),
    name,
    sortOrder: int(formData, "sortOrder") ?? 0,
  };

  if (id) {
    await db.update(playlists).set(values).where(eq(playlists.id, id));
  } else {
    await db.insert(playlists).values(values);
  }

  revalidatePath(PLAYLISTS_PATH);
  revalidatePath("/dalok");
  return { ok: true };
}

export async function deletePlaylist(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(playlists).where(eq(playlists.id, id));
    revalidatePath(PLAYLISTS_PATH);
    revalidatePath("/dalok");
  }
}
