"use client";

import { useActionState, useEffect, useId, useRef, useState } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { saveSong } from "@/lib/actions/songs";
import { initialActionState } from "@/lib/actions/types";
import { coverUrl, parseYoutubeId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { SubmitButton } from "@/components/submit-button";
import { Cover } from "@/components/media";
import { Emoji } from "@/components/emoji";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type PlaylistOption = { id: string; emoji: string | null; name: string };

export type SongFormData = {
  id: string;
  trackNumber: number | null;
  author: string;
  title: string;
  style: string | null;
  ytId: string | null;
  releaseDate: string | null;
  published: boolean;
  coverImageUrl: string | null;
  playlistIds: string[];
};

const STYLE_SUGGESTIONS = [
  "Pagan Folk Metal",
  "Cinematic Folk Doom",
  "Symphonic Folk Metal",
  "Vintage Hungarian Rock",
  "Classic Heavy Metal",
  "Ambient Cinematic Sacred",
  "Sacred Choral",
  "Cinematic Operatic",
  "Cinematic Post-Classical",
];

export function SongFormDialog({
  song,
  playlists,
  trigger,
}: {
  song?: SongFormData;
  playlists: PlaylistOption[];
  trigger?: "new" | "edit";
}) {
  const isEdit = Boolean(song);
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(saveSong, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);
  const datalistId = useId();

  const [ytInput, setYtInput] = useState(song?.ytId ?? "");
  const [removeCover, setRemoveCover] = useState(false);

  // Sikeres mentéskor: bezárás, toast, új dalnál űrlap ürítés.
  useEffect(() => {
    if (state.ok) {
      setOpen(false);
      toast.success(isEdit ? "Dal frissítve." : "Dal hozzáadva.");
      if (!isEdit) formRef.current?.reset();
    }
  }, [state, isEdit]);

  const livePreview =
    !removeCover &&
    coverUrl({
      coverImageUrl: song?.coverImageUrl,
      ytId: ytInput ? parseYoutubeId(ytInput) : null,
    });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "edit" ? (
          <Button variant="ghost" size="icon" title="Szerkesztés">
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4" /> Új dal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Dal szerkesztése" : "Új dal"}</DialogTitle>
          <DialogDescription>
            A borító a YT ID-ból automatikus, de felülírható saját feltöltéssel.
          </DialogDescription>
        </DialogHeader>

        <form ref={formRef} action={formAction} className="space-y-4">
          {song && <input type="hidden" name="id" value={song.id} />}
          {song?.coverImageUrl && (
            <input type="hidden" name="currentCover" value={song.coverImageUrl} />
          )}

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="space-y-1.5">
              <Label htmlFor="trackNumber">Sorszám</Label>
              <Input
                id="trackNumber"
                name="trackNumber"
                type="number"
                min={1}
                defaultValue={song?.trackNumber ?? ""}
              />
            </div>
            <div className="col-span-2 space-y-1.5 sm:col-span-3">
              <Label htmlFor="style">Stílus</Label>
              <Input
                id="style"
                name="style"
                list={datalistId}
                defaultValue={song?.style ?? ""}
                placeholder="pl. Pagan Folk Metal"
              />
              <datalist id={datalistId}>
                {STYLE_SUGGESTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="author">Szerző *</Label>
              <Input
                id="author"
                name="author"
                defaultValue={song?.author ?? ""}
                required
              />
              {state.fieldErrors?.author && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.author[0]}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Cím *</Label>
              <Input
                id="title"
                name="title"
                defaultValue={song?.title ?? ""}
                required
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-destructive">
                  {state.fieldErrors.title[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="ytId">YouTube ID vagy link</Label>
              <Input
                id="ytId"
                name="ytId"
                value={ytInput}
                onChange={(e) => setYtInput(e.target.value)}
                placeholder="pl. FJ3q2fYrTAs"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="releaseDate">Megjelenés / premier</Label>
              <Input
                id="releaseDate"
                name="releaseDate"
                type="date"
                defaultValue={song?.releaseDate ?? ""}
              />
            </div>
          </div>

          {/* Borító */}
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center gap-3">
              <Cover
                src={livePreview || null}
                alt="Borító előnézet"
                className="h-16 w-28"
              />
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="coverFile">Saját borító feltöltése</Label>
                <Input
                  id="coverFile"
                  name="coverFile"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/avif"
                  onChange={() => setRemoveCover(false)}
                />
                <p className="text-xs text-muted-foreground">
                  Üresen hagyva a YT ID borítója marad. Max 5 MB.
                </p>
              </div>
            </div>
            {song?.coverImageUrl && (
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={removeCover}
                  onCheckedChange={(v) => setRemoveCover(Boolean(v))}
                />
                <input
                  type="hidden"
                  name="removeCover"
                  value={removeCover ? "true" : ""}
                />
                Feltöltött borító eltávolítása (vissza a YT borítóra)
              </label>
            )}
          </div>

          {/* Lejátszási listák */}
          {playlists.length > 0 && (
            <div className="space-y-1.5">
              <Label>Lejátszási listák</Label>
              <div className="flex flex-wrap gap-2">
                {playlists.map((p) => {
                  const checked = song?.playlistIds.includes(p.id);
                  return (
                    <label
                      key={p.id}
                      className="inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm has-[:checked]:border-primary has-[:checked]:bg-secondary"
                    >
                      <Checkbox
                        name="playlistIds"
                        value={p.id}
                        defaultChecked={checked}
                      />
                      <span className="inline-flex items-center gap-1">
                        {p.emoji && <Emoji value={p.emoji} />}
                        {p.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm">
            <Checkbox name="published" defaultChecked={song?.published} />
            Megjelent
          </label>

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
