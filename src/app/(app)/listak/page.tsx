import { asc } from "drizzle-orm";
import { db } from "@/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
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
          <p className="text-sm text-muted-foreground">
            {playlists.length} lista
          </p>
        </div>
        <PlaylistFormDialog />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Emoji</TableHead>
              <TableHead>Név</TableHead>
              <TableHead>Dalok száma</TableHead>
              <TableHead className="w-20">Sorrend</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {playlists.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                  Még nincs lejátszási lista. Hozz létre egyet, majd a daloknál
                  rendelheted hozzá.
                </TableCell>
              </TableRow>
            )}
            {playlists.map((p) => (
              <TableRow key={p.id}>
                <TableCell className="text-2xl">{p.emoji ?? "—"}</TableCell>
                <TableCell className="font-medium">{p.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{p.songPlaylists.length} dal</Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {p.sortOrder}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
