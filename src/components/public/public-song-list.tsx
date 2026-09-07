"use client";

import { useMemo, useState } from "react";
import { ImageOff, ExternalLink } from "lucide-react";
import { coverUrl, normalizeForSearch, formatHuDate } from "@/lib/utils";
import { streamingPlatformRank } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Emoji } from "@/components/emoji";
import { SearchBar } from "@/components/search-bar";
import { FilterSelect } from "@/components/filter-select";
import { YoutubeLink } from "@/components/media";

export type PublicPlaylistOption = { id: string; emoji: string | null; name: string };

export type PublicSongCard = {
  id: string;
  trackNumber: number | null;
  author: string;
  title: string;
  style: string | null;
  ytId: string | null;
  releaseDate: string | null;
  coverImageUrl: string | null;
  playlistIds: string[];
  streamingLinks: { id: string; platform: string; url: string }[];
};

export function PublicSongList({
  songs,
  playlists,
}: {
  songs: PublicSongCard[];
  playlists: PublicPlaylistOption[];
}) {
  const [query, setQuery] = useState("");
  const [playlist, setPlaylist] = useState("all");
  const playlistById = useMemo(
    () => new Map(playlists.map((p) => [p.id, p])),
    [playlists],
  );

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    return songs.filter((s) => {
      if (playlist !== "all" && !s.playlistIds.includes(playlist)) return false;
      if (!q) return true;
      const hay = normalizeForSearch(`${s.author} ${s.title} ${s.style ?? ""}`);
      return hay.includes(q);
    });
  }, [songs, query, playlist]);

  const hasFilter = query !== "" || playlist !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Keresés szerzőre, címre, stílusra…"
        />
        {playlists.length > 0 && (
          <FilterSelect
            value={playlist}
            onChange={setPlaylist}
            aria-label="Lejátszási lista szűrő"
            options={[
              { value: "all", label: "Minden lista" },
              ...playlists.map((p) => ({
                value: p.id,
                label: `${p.emoji ? p.emoji + " " : ""}${p.name}`,
              })),
            ]}
          />
        )}
      </div>

      {hasFilter && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} találat (összesen {songs.length})
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {songs.length === 0
            ? "Még nincs megjelent dal."
            : "Nincs a keresésnek megfelelő dal."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((song) => {
            const cover = coverUrl({
              coverImageUrl: song.coverImageUrl,
              ytId: song.ytId,
            });
            const links = [...song.streamingLinks].sort(
              (a, b) =>
                streamingPlatformRank(a.platform) - streamingPlatformRank(b.platform),
            );
            return (
              <Card key={song.id} className="flex overflow-hidden">
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

                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                  <div className="min-w-0">
                    <div className="truncate text-xs text-muted-foreground">
                      {song.author}
                    </div>
                    <div className="font-semibold leading-tight">{song.title}</div>
                  </div>

                  {song.style && (
                    <div className="text-sm text-muted-foreground">{song.style}</div>
                  )}

                  {song.playlistIds.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {song.playlistIds.map((id) => {
                        const p = playlistById.get(id);
                        if (!p) return null;
                        return (
                          <Badge key={id} variant="secondary" title={p.name}>
                            {p.emoji ? <Emoji value={p.emoji} /> : p.name}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  {links.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {links.map((link) => (
                        <a
                          key={link.id}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 rounded-md border bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/70"
                        >
                          {link.platform}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <span className="text-xs text-muted-foreground">
                      {formatHuDate(song.releaseDate)}
                    </span>
                    <YoutubeLink ytId={song.ytId} label="YouTube" />
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
