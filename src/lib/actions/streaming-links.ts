"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songStreamingLinks } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { syncSongStreamingLinks } from "@/lib/hyperfollow";
import { str } from "./form";

const SONGS_PATH = "/dalok";
const LISTEN_PATH = "/hallgatas";

export async function addStreamingLink(formData: FormData): Promise<void> {
  await requireUser();
  const songId = str(formData, "songId");
  const platform = str(formData, "platform");
  const url = str(formData, "url");
  if (!songId || !platform || !url) return;
  await db.insert(songStreamingLinks).values({ songId, platform, url });
  revalidatePath(SONGS_PATH);
  revalidatePath(LISTEN_PATH);
}

export async function deleteStreamingLink(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(songStreamingLinks).where(eq(songStreamingLinks.id, id));
    revalidatePath(SONGS_PATH);
    revalidatePath(LISTEN_PATH);
  }
}

/** Kézi trigger: a dal Hyperfollow oldaláról frissíti a streaming linkeket. */
export async function syncStreamingLinksFromHyperfollow(
  formData: FormData,
): Promise<void> {
  await requireUser();
  const songId = str(formData, "songId");
  if (!songId) return;
  await syncSongStreamingLinks(songId);
  revalidatePath(SONGS_PATH);
  revalidatePath(LISTEN_PATH);
}
