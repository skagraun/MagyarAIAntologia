"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { saveWishlistItem } from "@/lib/actions/wishlist";
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

export type WishlistFormData = {
  id: string;
  requestedBy: string;
  requestedAt: string | null;
  author: string | null;
  title: string;
  feasible: "yes" | "no" | "maybe";
  publishedDate: string | null;
  ytId: string | null;
};

export function WishlistFormDialog({ item }: { item?: WishlistFormData }) {
  const isEdit = Boolean(item);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(
    saveWishlistItem,
    initialActionState,
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      toast.success(isEdit ? "Kérés frissítve." : "Kérés hozzáadva.");
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
            <Plus className="h-4 w-4" /> Új kérés
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Kérés szerkesztése" : "Új kívánság"}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {item && <input type="hidden" name="id" value={item.id} />}

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="requestedBy">Ki kérte *</Label>
              <Input
                id="requestedBy"
                name="requestedBy"
                defaultValue={item?.requestedBy ?? ""}
                required
              />
              {state.fieldErrors?.requestedBy && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.requestedBy[0]}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requestedAt">Mikor kérte</Label>
              <Input
                id="requestedAt"
                name="requestedAt"
                type="date"
                defaultValue={item?.requestedAt ?? ""}
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="author">Szerző</Label>
              <Input
                id="author"
                name="author"
                defaultValue={item?.author ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Cím *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={item?.title ?? ""}
                required
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.title[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="feasible">Elkészíthető?</Label>
              <select
                id="feasible"
                name="feasible"
                defaultValue={item?.feasible ?? "maybe"}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
              >
                {(["yes", "maybe", "no"] as const).map((f) => (
                  <option key={f} value={f}>
                    {feasibleLabel[f]}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="publishedDate">Publikálás dátuma</Label>
              <Input
                id="publishedDate"
                name="publishedDate"
                type="date"
                defaultValue={item?.publishedDate ?? ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ytId">YouTube ID / link</Label>
              <Input id="ytId" name="ytId" defaultValue={item?.ytId ?? ""} />
            </div>
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
