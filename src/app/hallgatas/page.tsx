import { desc, eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { playlists as playlistsTable } from "@/db/schema";
import { songs as songsTable } from "@/db/schema";
import {
  PublicSongList,
  type PublicSongCard,
} from "@/components/public/public-song-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hallgatás — Magyar AI Antológia",
  description:
    "A Magyar AI Antológia dalai — Spotify, Apple Music és egyéb streaming linkek egy helyen.",
};

export default async function HallgatasPage() {
  const [songs, playlists] = await Promise.all([
    db.query.songs.findMany({
      where: eq(songsTable.published, true),
      orderBy: (s) => [desc(s.trackNumber), desc(s.releaseDate)],
      with: {
        songPlaylists: true,
        streamingLinks: { orderBy: (l) => [asc(l.createdAt)] },
      },
    }),
    db
      .select()
      .from(playlistsTable)
      .orderBy(asc(playlistsTable.sortOrder), asc(playlistsTable.name)),
  ]);

  const cards: PublicSongCard[] = songs.map((song) => ({
    id: song.id,
    trackNumber: song.trackNumber,
    author: song.author,
    title: song.title,
    style: song.style,
    ytId: song.ytId,
    releaseDate: song.releaseDate,
    coverImageUrl: song.coverImageUrl,
    playlistIds: song.songPlaylists.map((sp) => sp.playlistId),
    streamingLinks: song.streamingLinks.map((l) => ({
      id: l.id,
      platform: l.platform,
      url: l.url,
    })),
  }));

  const playlistOptions = playlists.map((p) => ({
    id: p.id,
    emoji: p.emoji,
    name: p.name,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto w-full max-w-7xl px-4 py-8">
        <header className="mb-6 space-y-1">
          <h1 className="text-2xl font-semibold">🎼 Magyar AI Antológia</h1>
          <p className="text-sm text-muted-foreground">
            Hallgasd meg a dalokat Spotify-on, Apple Musicon vagy bármelyik
            streaming szolgáltatón.
          </p>
        </header>

        <PublicSongList songs={cards} playlists={playlistOptions} />
      </div>
    </div>
  );
}
