import { asc } from "drizzle-orm";
import { db } from "@/db";
import { playlists as playlistsTable } from "@/db/schema";
import { coverUrl } from "@/lib/utils";
import { formatHuDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Cover, YoutubeLink } from "@/components/media";
import { DeleteButton } from "@/components/delete-button";
import { SongFormDialog } from "@/components/songs/song-form-dialog";
import { WorkingTitlesDialog } from "@/components/songs/working-titles-dialog";
import { deleteSong } from "@/lib/actions/songs";

export const dynamic = "force-dynamic";

export default async function SongsPage() {
  const [songs, playlists] = await Promise.all([
    db.query.songs.findMany({
      orderBy: (s) => [asc(s.trackNumber), asc(s.createdAt)],
      with: {
        songPlaylists: { with: { playlist: true } },
        workingTitles: { orderBy: (w) => [asc(w.createdAt)] },
      },
    }),
    db
      .select()
      .from(playlistsTable)
      .orderBy(asc(playlistsTable.sortOrder), asc(playlistsTable.name)),
  ]);

  const publishedCount = songs.filter((s) => s.published).length;

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
        <SongFormDialog playlists={playlists} />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">#</TableHead>
              <TableHead>Borító</TableHead>
              <TableHead>Szerző</TableHead>
              <TableHead>Cím</TableHead>
              <TableHead>Stílus</TableHead>
              <TableHead>Listák</TableHead>
              <TableHead>Megjelenés</TableHead>
              <TableHead>Állapot</TableHead>
              <TableHead>YouTube</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {songs.length === 0 && (
              <TableRow>
                <TableCell colSpan={10} className="py-10 text-center text-muted-foreground">
                  Még nincs dal rögzítve. Kattints az „Új dal" gombra.
                </TableCell>
              </TableRow>
            )}
            {songs.map((song) => {
              const playlistIds = song.songPlaylists.map((sp) => sp.playlistId);
              return (
                <TableRow key={song.id}>
                  <TableCell className="text-muted-foreground">
                    {song.trackNumber ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Cover
                      src={coverUrl({
                        coverImageUrl: song.coverImageUrl,
                        ytId: song.ytId,
                      })}
                      alt={song.title}
                    />
                  </TableCell>
                  <TableCell className="font-medium">{song.author}</TableCell>
                  <TableCell>{song.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {song.style ?? "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {song.songPlaylists.map((sp) => (
                        <Badge key={sp.playlistId} variant="secondary" title={sp.playlist.name}>
                          {sp.playlist.emoji ?? sp.playlist.name}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {formatHuDate(song.releaseDate)}
                  </TableCell>
                  <TableCell>
                    {song.published ? (
                      <Badge variant="success">Megjelent</Badge>
                    ) : (
                      <Badge variant="warning">Bemutató előtt</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <YoutubeLink ytId={song.ytId} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-0.5">
                      <WorkingTitlesDialog
                        songId={song.id}
                        songTitle={`${song.author} — ${song.title}`}
                        workingTitles={song.workingTitles}
                      />
                      <SongFormDialog
                        trigger="edit"
                        playlists={playlists}
                        song={{
                          id: song.id,
                          trackNumber: song.trackNumber,
                          author: song.author,
                          title: song.title,
                          style: song.style,
                          ytId: song.ytId,
                          releaseDate: song.releaseDate,
                          published: song.published,
                          coverImageUrl: song.coverImageUrl,
                          playlistIds,
                        }}
                      />
                      <DeleteButton
                        id={song.id}
                        action={deleteSong}
                        label="Dal törlése"
                        description={`Biztosan törlöd: ${song.author} — ${song.title}? A Suno munkacímek is törlődnek.`}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
