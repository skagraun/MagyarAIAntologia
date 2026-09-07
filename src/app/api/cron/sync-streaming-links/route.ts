import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { songs } from "@/db/schema";
import { syncSongStreamingLinks } from "@/lib/hyperfollow";

export const dynamic = "force-dynamic";

/**
 * Napi cron (l. vercel.json): a Hyperfollow linkkel rendelkező dalok
 * streaming linkjeinek frissítése a DistroKid oldaláról.
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const candidates = await db
    .select({ id: songs.id, title: songs.title })
    .from(songs)
    .where(isNotNull(songs.hyperfollowUrl));

  const results: { id: string; title: string; updated: number; error?: string }[] = [];
  for (const song of candidates) {
    try {
      const updated = await syncSongStreamingLinks(song.id);
      results.push({ id: song.id, title: song.title, updated });
    } catch (e) {
      results.push({
        id: song.id,
        title: song.title,
        updated: 0,
        error: e instanceof Error ? e.message : "Ismeretlen hiba.",
      });
    }
  }

  revalidatePath("/dalok");
  revalidatePath("/hallgatas");

  return NextResponse.json({
    checked: candidates.length,
    updatedLinks: results.reduce((sum, r) => sum + r.updated, 0),
    results,
  });
}
