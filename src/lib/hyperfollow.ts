import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { songs, songStreamingLinks } from "@/db/schema";

/** DistroKid store kulcs -> megjelenítendő platformnév. */
const STORE_LABELS: Record<string, string> = {
  spotify: "Spotify",
  applemusic: "Apple Music",
  itunes: "iTunes",
  amazon: "Amazon Music",
  amazonmusic: "Amazon Music",
  youtubemusic: "YouTube Music",
  youtube: "YouTube",
  deezer: "Deezer",
  tidal: "Tidal",
  soundcloud: "SoundCloud",
  pandora: "Pandora",
  napster: "Napster",
  iheartradio: "iHeartRadio",
};

function storeLabel(key: string): string {
  return (
    STORE_LABELS[key] ??
    key.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c.toUpperCase())
  );
}

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * A Hyperfollow oldal store-linkjeit tartalmazó <a> tag-ek kinyerése.
 * Az oldal szerver-renderelt: minden élő store egy
 * `data-testid="hyperfollow-store-link" data-hyperfollow-store="spotify"` jelölésű <a>.
 */
export function parseHyperfollowStoreLinks(
  html: string,
): { platform: string; url: string }[] {
  const links: { platform: string; url: string }[] = [];
  const tagPattern = /<a\b[^>]*data-testid="hyperfollow-store-link"[^>]*>/g;
  for (const tagMatch of html.matchAll(tagPattern)) {
    const tag = tagMatch[0];
    const hrefMatch = /href="([^"]*)"/.exec(tag);
    const storeMatch = /data-hyperfollow-store="([^"]*)"/.exec(tag);
    if (!hrefMatch || !storeMatch) continue;
    const url = decodeHtmlEntities(hrefMatch[1]);
    const platform = storeLabel(storeMatch[1]);
    links.push({ platform, url });
  }
  return links;
}

/** Lekéri és kiparszolja egy Hyperfollow oldal store-linkjeit. */
export async function fetchHyperfollowStoreLinks(
  url: string,
): Promise<{ platform: string; url: string }[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Hyperfollow oldal lekérése sikertelen (${res.status}).`);
  }
  const html = await res.text();
  return parseHyperfollowStoreLinks(html);
}

/**
 * Egy dal streaming linkjeinek frissítése a Hyperfollow oldaláról.
 * Csak a scraperben ténylegesen megtalált platformokat írja felül (upsert
 * platform szerint) — a DistroKid-en nem szereplő, kézzel felvitt linkeket
 * (pl. Bandcamp) nem érinti. Visszaadja a frissített linkek számát.
 */
export async function syncSongStreamingLinks(songId: string): Promise<number> {
  const [song] = await db
    .select({ hyperfollowUrl: songs.hyperfollowUrl })
    .from(songs)
    .where(eq(songs.id, songId))
    .limit(1);
  if (!song?.hyperfollowUrl) return 0;

  const links = await fetchHyperfollowStoreLinks(song.hyperfollowUrl);
  if (links.length === 0) return 0;

  for (const link of links) {
    await db
      .insert(songStreamingLinks)
      .values({ songId, platform: link.platform, url: link.url })
      .onConflictDoUpdate({
        target: [songStreamingLinks.songId, songStreamingLinks.platform],
        set: { url: link.url },
      });
  }
  return links.length;
}
