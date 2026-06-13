"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import {
  songs,
  songPlaylists,
  songWorkingTitles,
  type workingTitleStatus,
} from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { parseYoutubeId } from "@/lib/utils";
import { uploadCover } from "@/lib/blob";
import { str, int, bool, dateStr } from "./form";
import type { ActionState } from "./types";

type WtStatus = (typeof workingTitleStatus.enumValues)[number];

const SONGS_PATH = "/dalok";

/** Dal létrehozása vagy módosítása (az `id` mező megléte dönt). */
export async function saveSong(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = str(formData, "id");
  const author = str(formData, "author");
  const title = str(formData, "title");

  const fieldErrors: Record<string, string[]> = {};
  if (!author) fieldErrors.author = ["A szerző megadása kötelező."];
  if (!title) fieldErrors.title = ["A cím megadása kötelező."];
  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };

  const ytRaw = str(formData, "ytId");
  const ytId = ytRaw ? parseYoutubeId(ytRaw) : null;

  // Borító feloldása: törlés > új feltöltés > kézi URL > meglévő.
  let coverImageUrl: string | null;
  try {
    const removeCover = bool(formData, "removeCover");
    const uploaded = await uploadCover(formData.get("coverFile") as File | null);
    if (removeCover) {
      coverImageUrl = null;
    } else if (uploaded) {
      coverImageUrl = uploaded;
    } else {
      coverImageUrl = str(formData, "coverImageUrl") ?? str(formData, "currentCover");
    }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Borító hiba." };
  }

  const values = {
    trackNumber: int(formData, "trackNumber"),
    author: author!,
    title: title!,
    style: str(formData, "style"),
    ytId,
    releaseDate: dateStr(formData, "releaseDate"),
    published: bool(formData, "published"),
    coverImageUrl,
    updatedAt: new Date(),
  };

  let songId: string;
  if (id) {
    await db.update(songs).set(values).where(eq(songs.id, id));
    songId = id;
  } else {
    const [created] = await db
      .insert(songs)
      .values(values)
      .returning({ id: songs.id });
    songId = created.id;
  }

  // Lejátszási listák (M:N) frissítése: töröljük a régieket, beszúrjuk az újakat.
  const playlistIds = formData
    .getAll("playlistIds")
    .filter((v): v is string => typeof v === "string" && v.length > 0);
  await db.delete(songPlaylists).where(eq(songPlaylists.songId, songId));
  if (playlistIds.length > 0) {
    await db
      .insert(songPlaylists)
      .values(playlistIds.map((playlistId) => ({ songId, playlistId })));
  }

  revalidatePath(SONGS_PATH);
  return { ok: true };
}

export async function deleteSong(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(songs).where(eq(songs.id, id));
    revalidatePath(SONGS_PATH);
  }
}

export async function toggleSongPublished(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  const published = bool(formData, "published");
  if (id) {
    await db
      .update(songs)
      .set({ published, updatedAt: new Date() })
      .where(eq(songs.id, id));
    revalidatePath(SONGS_PATH);
  }
}

// ---------------------------------------------------------------------------
// Suno munkacím-napló
// ---------------------------------------------------------------------------

export async function addWorkingTitle(formData: FormData): Promise<void> {
  await requireUser();
  const songId = str(formData, "songId");
  const title = str(formData, "title");
  if (!songId || !title) return;
  const status = (str(formData, "status") as WtStatus | null) ?? "draft";
  await db.insert(songWorkingTitles).values({
    songId,
    title,
    status,
    note: str(formData, "note"),
  });
  revalidatePath(SONGS_PATH);
}

export async function setWorkingTitleStatus(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  const status = str(formData, "status") as WtStatus | null;
  if (!id || !status) return;
  await db
    .update(songWorkingTitles)
    .set({ status })
    .where(eq(songWorkingTitles.id, id));
  revalidatePath(SONGS_PATH);
}

export async function deleteWorkingTitle(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(songWorkingTitles).where(eq(songWorkingTitles.id, id));
    revalidatePath(SONGS_PATH);
  }
}
