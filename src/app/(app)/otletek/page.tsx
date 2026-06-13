import { desc } from "drizzle-orm";
import { db } from "@/db";
import { ideas as ideasTable } from "@/db/schema";
import { IdeaFormDialog } from "@/components/ideas/idea-form-dialog";
import { IdeaList } from "@/components/ideas/idea-list";

export const dynamic = "force-dynamic";

export default async function IdeasPage() {
  const items = await db
    .select()
    .from(ideasTable)
    .orderBy(desc(ideasTable.createdAt));

  const data = items.map((idea) => ({
    id: idea.id,
    performer: idea.performer,
    title: idea.title,
    feasible: idea.feasible,
  }));

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

      <IdeaList ideas={data} />
    </div>
  );
}
