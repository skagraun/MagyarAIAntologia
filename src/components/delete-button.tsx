"use client";

import { useRef } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Megerősítést kérő törlés gomb. A megadott server action-t hívja egy rejtett
 * `id` mezővel. Általános, bármelyik entitáshoz használható.
 */
export function DeleteButton({
  id,
  action,
  label = "Törlés",
  description = "Biztosan törölni szeretnéd? A művelet nem vonható vissza.",
}: {
  id: string;
  action: (formData: FormData) => void | Promise<void>;
  label?: string;
  description?: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive"
          title={label}
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">{label}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={action}>
          <input type="hidden" name="id" value={id} />
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Mégse
              </Button>
            </DialogClose>
            <Button type="submit" variant="destructive">
              {label}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
