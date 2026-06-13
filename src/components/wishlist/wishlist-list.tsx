"use client";

import { useMemo, useState } from "react";
import { Heart } from "lucide-react";
import { coverUrl, formatHuDate, normalizeForSearch } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/search-bar";
import { FilterSelect } from "@/components/filter-select";
import { YoutubeLink } from "@/components/media";
import { DeleteButton } from "@/components/delete-button";
import { feasibleLabel, feasibleVariant } from "@/lib/labels";
import { deleteWishlistItem } from "@/lib/actions/wishlist";
import {
  WishlistFormDialog,
  type WishlistFormData,
} from "@/components/wishlist/wishlist-form-dialog";

export function WishlistList({ items }: { items: WishlistFormData[] }) {
  const [query, setQuery] = useState("");
  const [feasible, setFeasible] = useState("all");

  const filtered = useMemo(() => {
    const q = normalizeForSearch(query);
    return items.filter((i) => {
      if (feasible !== "all" && i.feasible !== feasible) return false;
      if (!q) return true;
      return normalizeForSearch(
        `${i.requestedBy} ${i.author ?? ""} ${i.title}`,
      ).includes(q);
    });
  }, [items, query, feasible]);

  const hasFilter = query !== "" || feasible !== "all";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SearchBar
          value={query}
          onChange={setQuery}
          placeholder="Keresés kérőre, szerzőre, címre…"
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
          {filtered.length} találat (összesen {items.length})
        </p>
      )}

      {filtered.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">
          {items.length === 0
            ? "Még nincs kívánság rögzítve."
            : "Nincs a keresésnek megfelelő kérés."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const cover = coverUrl({ coverImageUrl: null, ytId: item.ytId });
            return (
              <Card key={item.id} className="flex overflow-hidden">
                <div className="relative w-24 shrink-0 bg-muted sm:w-28">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <Heart className="h-5 w-5" />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      {item.author && (
                        <div className="truncate text-xs text-muted-foreground">
                          {item.author}
                        </div>
                      )}
                      <div className="font-semibold leading-tight">
                        {item.title}
                      </div>
                    </div>
                    <Badge
                      variant={feasibleVariant[item.feasible]}
                      className="shrink-0"
                    >
                      {feasibleLabel[item.feasible]}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Kérte: <span className="text-foreground">{item.requestedBy}</span>
                    {item.requestedAt && ` · ${formatHuDate(item.requestedAt)}`}
                  </div>

                  <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {item.publishedDate && (
                        <span>Publikálva: {formatHuDate(item.publishedDate)}</span>
                      )}
                      <YoutubeLink ytId={item.ytId} />
                    </div>
                    <div className="flex items-center gap-0.5">
                      <WishlistFormDialog item={item} />
                      <DeleteButton
                        id={item.id}
                        action={deleteWishlistItem}
                        label="Kérés törlése"
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
