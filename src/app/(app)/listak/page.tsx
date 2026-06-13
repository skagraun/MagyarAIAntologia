import { asc } from "drizzle-orm";
import { db } from "@/db";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DeleteButton } from "@/components/delete-button";
import { PlaylistFormDialog } from "@/components/playlists/playlist-form-dialog";
import { deletePlaylist } from "@/lib/actions/playlists";

export const dynamic = "force-dynamic";

export default async function PlaylistsPage() {
  const playlists = await db.query.playlists.findMany({
    orderBy: (p) => [asc(p.sortOrder), asc(p.name)],
    with: { songPlaylists: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Lejátszási listák</h1>
          <p className="text-sm text-muted-foreground">{playlists.length} lista</p>
        </div>
        <PlaylistFormDialog />
      </div>

      {playlists.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          Még nincs lejátszási lista. Hozz létre egyet, majd a daloknál
          rendelheted hozzá.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {playlists.map((p) => (
            <Card key={p.id} className="flex items-center gap-3 p-3">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-muted text-3xl">
                {p.emoji ?? "🎵"}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{p.name}</div>
                <Badge variant="secondary" className="mt-1">
                  {p.songPlaylists.length} dal
                </Badge>
              </div>
              <div className="flex items-center gap-0.5">
                <PlaylistFormDialog
                  playlist={{
                    id: p.id,
                    emoji: p.emoji,
                    name: p.name,
                    sortOrder: p.sortOrder,
                  }}
                />
                <DeleteButton
                  id={p.id}
                  action={deletePlaylist}
                  label="Lista törlése"
                  description={`Biztosan törlöd a(z) "${p.name}" listát? A dalokról is lekerül a hozzárendelés.`}
                />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
