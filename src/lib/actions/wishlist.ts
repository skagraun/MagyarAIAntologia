"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlist, type feasibility } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { parseYoutubeId } from "@/lib/utils";
import { str, dateStr } from "./form";
import type { ActionState } from "./types";

type Feasible = (typeof feasibility.enumValues)[number];
const WISHLIST_PATH = "/kivansaglista";

export async function saveWishlistItem(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = str(formData, "id");
  const requestedBy = str(formData, "requestedBy");
  const title = str(formData, "title");

  const fieldErrors: Record<string, string[]> = {};
  if (!requestedBy) fieldErrors.requestedBy = ["Add meg, ki kérte."];
  if (!title) fieldErrors.title = ["A cím megadása kötelező."];
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const ytRaw = str(formData, "ytId");
  const values = {
    requestedBy: requestedBy!,
    requestedAt: dateStr(formData, "requestedAt"),
    author: str(formData, "author"),
    title: title!,
    feasible: (str(formData, "feasible") as Feasible | null) ?? "maybe",
    publishedDate: dateStr(formData, "publishedDate"),
    ytId: ytRaw ? parseYoutubeId(ytRaw) : null,
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(wishlist).set(values).where(eq(wishlist.id, id));
  } else {
    await db.insert(wishlist).values(values);
  }

  revalidatePath(WISHLIST_PATH);
  return { ok: true };
}

export async function deleteWishlistItem(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(wishlist).where(eq(wishlist.id, id));
    revalidatePath(WISHLIST_PATH);
  }
}
