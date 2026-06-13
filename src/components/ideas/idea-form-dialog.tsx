"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { saveIdea } from "@/lib/actions/ideas";
import { initialActionState } from "@/lib/actions/types";
import { feasibleLabel } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type IdeaFormData = {
  id: string;
  performer: string | null;
  title: string;
  feasible: "yes" | "no" | "maybe";
};

export function IdeaFormDialog({ idea }: { idea?: IdeaFormData }) {
  const isEdit = Boolean(idea);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(saveIdea, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      toast.success(isEdit ? "Ötlet frissítve." : "Ötlet hozzáadva.");
      if (!isEdit) formRef.current?.reset();
    }
  }, [state, isEdit]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="ghost" size="icon" title="Szerkesztés">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Új ötlet
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Ötlet szerkesztése" : "Új ötlet"}</DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {idea && <input type="hidden" name="id" value={idea.id} />}

          <div className="space-y-1.5">
            <Label htmlFor="performer">Előadó</Label>
            <Input
              id="performer"
              name="performer"
              defaultValue={idea?.performer ?? ""}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="title">Cím *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={idea?.title ?? ""}
              required
            />
            {state.fieldErrors?.title && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.title[0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="feasible">Elkészíthető?</Label>
            <select
              id="feasible"
              name="feasible"
              defaultValue={idea?.feasible ?? "maybe"}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
            >
              {(["yes", "maybe", "no"] as const).map((f) => (
                <option key={f} value={f}>
                  {feasibleLabel[f]}
                </option>
              ))}
            </select>
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Mégse
            </Button>
            <SubmitButton pendingText="Mentés…">Mentés</SubmitButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
