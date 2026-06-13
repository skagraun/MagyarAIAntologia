"use client";

import { useState } from "react";
import { NotebookPen, Trash2 } from "lucide-react";
import {
  addWorkingTitle,
  deleteWorkingTitle,
  setWorkingTitleStatus,
} from "@/lib/actions/songs";
import { workingTitleLabel, workingTitleVariant } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type WtStatus = "draft" | "final" | "discarded";

export type WorkingTitle = {
  id: string;
  title: string;
  status: WtStatus;
  note: string | null;
};

const STATUSES: WtStatus[] = ["draft", "final", "discarded"];

export function WorkingTitlesDialog({
  songId,
  songTitle,
  workingTitles,
}: {
  songId: string;
  songTitle: string;
  workingTitles: WorkingTitle[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Suno munkacímek"
          className="relative"
        >
          <NotebookPen className="h-4 w-4" />
          {workingTitles.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
              {workingTitles.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Suno munkacímek</DialogTitle>
          <DialogDescription>{songTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {workingTitles.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Még nincs munkacím rögzítve.
            </p>
          )}
          {workingTitles.map((wt) => (
            <div
              key={wt.id}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              <div className="flex-1">
                <div className="font-medium">{wt.title}</div>
                {wt.note && (
                  <div className="text-xs text-muted-foreground">{wt.note}</div>
                )}
              </div>
              <Badge variant={workingTitleVariant[wt.status]}>
                {workingTitleLabel[wt.status]}
              </Badge>
              <form action={setWorkingTitleStatus}>
                <input type="hidden" name="id" value={wt.id} />
                <select
                  name="status"
                  defaultValue={wt.status}
                  onChange={(e) => e.currentTarget.form?.requestSubmit()}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-xs"
                  aria-label="Állapot"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {workingTitleLabel[s]}
                    </option>
                  ))}
                </select>
              </form>
              <form action={deleteWorkingTitle}>
                <input type="hidden" name="id" value={wt.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  title="Törlés"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>

        <form
          action={addWorkingTitle}
          className="flex flex-wrap items-end gap-2 border-t pt-3"
        >
          <input type="hidden" name="songId" value={songId} />
          <div className="flex-1 space-y-1">
            <label className="text-xs font-medium" htmlFor={`wt-title-${songId}`}>
              Új munkacím
            </label>
            <Input
              id={`wt-title-${songId}`}
              name="title"
              required
              placeholder="pl. Komp sötétség"
              className="h-8"
            />
          </div>
          <select
            name="status"
            defaultValue="draft"
            className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
            aria-label="Állapot"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {workingTitleLabel[s]}
              </option>
            ))}
          </select>
          <Button type="submit" size="sm">
            Hozzáad
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
