"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { savePlaylist } from "@/lib/actions/playlists";
import { initialActionState } from "@/lib/actions/types";
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

export type PlaylistFormData = {
  id: string;
  emoji: string | null;
  name: string;
  sortOrder: number;
};

export function PlaylistFormDialog({ playlist }: { playlist?: PlaylistFormData }) {
  const isEdit = Boolean(playlist);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(savePlaylist, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      toast.success(isEdit ? "Lista frissítve." : "Lista hozzáadva.");
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
            <Plus className="h-4 w-4" /> Új lista
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Lista szerkesztése" : "Új lejátszási lista"}
          </DialogTitle>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {playlist && <input type="hidden" name="id" value={playlist.id} />}

          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="emoji">Emoji</Label>
              <Input
                id="emoji"
                name="emoji"
                maxLength={4}
                defaultValue={playlist?.emoji ?? ""}
                placeholder="⚔️"
              />
            </div>
            <div className="col-span-3 space-y-1.5">
              <Label htmlFor="name">Név *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={playlist?.name ?? ""}
                required
              />
              {state.fieldErrors?.name && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.name[0]}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sortOrder">Sorrend</Label>
            <Input
              id="sortOrder"
              name="sortOrder"
              type="number"
              defaultValue={playlist?.sortOrder ?? 0}
            />
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
