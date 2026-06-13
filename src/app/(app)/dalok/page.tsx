import { asc } from "drizzle-orm";
import { db } from "@/db";
import { playlists as playlistsTable } from "@/db/schema";
import { SongFormDialog } from "@/components/songs/song-form-dialog";
import { SongList, type SongCard } from "@/components/songs/song-list";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const [songs, playlists] = await Promise.all([
    db.query.songs.findMany({
      orderBy: (s) => [asc(s.trackNumber), asc(s.createdAt)],
      with: {
        songPlaylists: true,
        workingTitles: { orderBy: (w) => [asc(w.createdAt)] },
      },
    }),
    db
      .select()
      .from(playlistsTable)
      .orderBy(asc(playlistsTable.sortOrder), asc(playlistsTable.name)),
  ]);

  const publishedCount = songs.filter((s) => s.published).length;

  const cards: SongCard[] = songs.map((song) => ({
    id: song.id,
    trackNumber: song.trackNumber,
    author: song.author,
    title: song.title,
    style: song.style,
    ytId: song.ytId,
    releaseDate: song.releaseDate,
    published: song.published,
    coverImageUrl: song.coverImageUrl,
    playlistIds: song.songPlaylists.map((sp) => sp.playlistId),
    workingTitles: song.workingTitles.map((w) => ({
      id: w.id,
      title: w.title,
      status: w.status,
      note: w.note,
    })),
  }));

  const playlistOptions = playlists.map((p) => ({
    id: p.id,
    emoji: p.emoji,
    name: p.name,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Dalok</h1>
          <p className="text-sm text-muted-foreground">
            {songs.length} dal · {publishedCount} megjelent ·{" "}
            {songs.length - publishedCount} bemutató előtt
          </p>
        </div>
        <SongFormDialog playlists={playlistOptions} />
      </div>

      <SongList songs={cards} playlists={playlistOptions} />
    </div>
  );
}
