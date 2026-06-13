"use client";

import { useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { coverUrl, normalizeForSearch } from "@/lib/utils";
import { formatHuDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { YoutubeLink } from "@/components/media";
import { DeleteButton } from "@/components/delete-button";
import { deleteSong } from "@/lib/actions/songs";
import {
  SongFormDialog,
  type SongFormData,
  type PlaylistOption,
} from "@/components/songs/song-form-dialog";
import {
  WorkingTitlesDialog,
  type WorkingTitle,
} from "@/components/songs/working-titles-dialog";

export type SongCard = SongFormData & { workingTitles: WorkingTitle[] };

export function SongList({
  songs,
  playlists,
}: {
  songs: SongCard[];
  playlists: PlaylistOption[];
}) {
  const [query, setQuery] = useState("");
  const playlistById = useMemo(
    () => new Map(playlists.map((p) => [p.id, p])),
    [playlists],
  );

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    if (!q) return songs;
    return songs.filter((s) => {
      const hay = normalizeForSearch(`${s.author} ${s.title} ${s.style ?? ""}`);
      return hay.includes(q);
    });
  }, [songs, query]);

  return (
    <div className="space-y-4">
      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Keresés szerzőre, címre, stílusra…"
      />

      {query && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} találat a(z) „{query}" keresésre
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {songs.length === 0
            ? 'Még nincs dal rögzítve. Kattints az „Új dal" gombra.'
            : "Nincs a keresésnek megfelelő dal."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((song) => {
            const cover = coverUrl({
              coverImageUrl: song.coverImageUrl,
              ytId: song.ytId,
            });
            return (
              <Card key={song.id} className="flex overflow-hidden">
                {/* Borító — bal oldalt, teljes magasságban */}
                <div className="relative w-28 shrink-0 bg-muted sm:w-32">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={song.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-5 w-5" />
                    </div>
                  )}
                  {song.trackNumber != null && (
                    <span className="absolute left-1.5 top-1.5 rounded bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
                      #{song.trackNumber}
                    </span>
                  )}
                </div>

                {/* Részletek */}
                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="truncate text-xs text-muted-foreground">
                        {song.author}
                      </div>
                      <div className="font-semibold leading-tight">
                        {song.title}
                      </div>
                    </div>
                    {song.published ? (
                      <Badge variant="success" className="shrink-0">
                        Megjelent
                      </Badge>
                    ) : (
                      <Badge variant="warning" className="shrink-0">
                        Bemutató előtt
                      </Badge>
                    )}
                  </div>

                  {song.style && (
                    <div className="text-sm text-muted-foreground">
                      {song.style}
                    </div>
                  )}

                  {song.playlistIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {song.playlistIds.map((id) => {
                        const p = playlistById.get(id);
                        if (!p) return null;
                        return (
                          <Badge key={id} variant="secondary" title={p.name}>
                            {p.emoji ?? p.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      <span>{formatHuDate(song.releaseDate)}</span>
                      <YoutubeLink ytId={song.ytId} />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <WorkingTitlesDialog
                        songId={song.id}
                        songTitle={`${song.author} — ${song.title}`}
                        workingTitles={song.workingTitles}
                      />
                      <SongFormDialog
                        trigger="edit"
                        playlists={playlists}
                        song={song}
                      />
                      <DeleteButton
                        id={song.id}
                        action={deleteSong}
                        label="Dal törlése"
                        description={`Biztosan törlöd: ${song.author} — ${song.title}? A Suno munkacímek is törlődnek.`}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
