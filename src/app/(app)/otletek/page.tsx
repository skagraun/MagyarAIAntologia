import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ideas as ideasTable } from "@/db/schema";
import { feasibleLabel, feasibleVariant } from "@/lib/labels";
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
import { IdeaFormDialog } from "@/components/ideas/idea-form-dialog";
import { deleteIdea } from "@/lib/actions/ideas";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const items = await db
    .select()
    .from(ideasTable)
    .orderBy(desc(ideasTable.createdAt));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Ötletek</h1>
          <p className="text-sm text-muted-foreground">
            {items.length} ötlet a további dalokhoz
          </p>
        </div>
        <IdeaFormDialog />
      </div>

      <div className="rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Előadó</TableHead>
              <TableHead>Cím</TableHead>
              <TableHead>Elkészíthető?</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  Még nincs ötlet rögzítve.
                </TableCell>
              </TableRow>
            )}
            {items.map((idea) => (
              <TableRow key={idea.id}>
                <TableCell className="text-muted-foreground">
                  {idea.performer ?? "—"}
                </TableCell>
                <TableCell className="font-medium">{idea.title}</TableCell>
                <TableCell>
                  <Badge variant={feasibleVariant[idea.feasible]}>
                    {feasibleLabel[idea.feasible]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-0.5">
                    <IdeaFormDialog
                      idea={{
                        id: idea.id,
                        performer: idea.performer,
                        title: idea.title,
                        feasible: idea.feasible,
                      }}
                    />
                    <DeleteButton
                      id={idea.id}
                      action={deleteIdea}
                      label="Ötlet törlése"
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
