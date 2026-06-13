"use client";

import { useMemo, useState } from "react";
import { Lightbulb } from "lucide-react";
import { normalizeForSearch } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { FilterSelect } from "@/components/filter-select";
import { DeleteButton } from "@/components/delete-button";
import { feasibleLabel, feasibleVariant } from "@/lib/labels";
import { deleteIdea } from "@/lib/actions/ideas";
import {
  IdeaFormDialog,
  type IdeaFormData,
} from "@/components/ideas/idea-form-dialog";

export function IdeaList({ ideas }: { ideas: IdeaFormData[] }) {
  const [query, setQuery] = useState("");
  const [feasible, setFeasible] = useState("all");

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    return ideas.filter((i) => {
      if (feasible !== "all" && i.feasible !== feasible) return false;
      if (!q) return true;
      return normalizeForSearch(`${i.performer ?? ""} ${i.title}`).includes(q);
    });
  }, [ideas, query, feasible]);

  const hasFilter = query !== "" || feasible !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Keresés előadóra, címre…"
        />
        <FilterSelect
          value={feasible}
          onChange={setFeasible}
          aria-label="Elkészíthetőség szűrő"
          options={[
            { value: "all", label: "Mind (elkészíthető?)" },
            { value: "yes", label: feasibleLabel.yes },
            { value: "maybe", label: feasibleLabel.maybe },
            { value: "no", label: feasibleLabel.no },
          ]}
        />
      </div>

      {hasFilter && (
        <p className="text-sm text-muted-foreground">
          {filtered.length} találat (összesen {ideas.length})
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {ideas.length === 0
            ? "Még nincs ötlet rögzítve."
            : "Nincs a keresésnek megfelelő ötlet."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((idea) => (
            <Card key={idea.id} className="flex overflow-hidden">
              <div className="flex w-16 shrink-0 items-center justify-center bg-muted text-muted-foreground">
                <Lightbulb className="h-5 w-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    {idea.performer && (
                      <div className="truncate text-xs text-muted-foreground">
                        {idea.performer}
                      </div>
                    )}
                    <div className="font-semibold leading-tight">
                      {idea.title}
                    </div>
                  </div>
                  <Badge
                    variant={feasibleVariant[idea.feasible]}
                    className="shrink-0"
                  >
                    {feasibleLabel[idea.feasible]}
                  </Badge>
                </div>
                <div className="mt-auto flex items-center justify-end gap-0.5 pt-1">
                  <IdeaFormDialog idea={idea} />
                  <DeleteButton
                    id={idea.id}
                    action={deleteIdea}
                    label="Ötlet törlése"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
