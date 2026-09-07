"use client";

import { useId, useState } from "react";
import { Link2, Trash2, ExternalLink } from "lucide-react";
import {
  addStreamingLink,
  deleteStreamingLink,
} from "@/lib/actions/streaming-links";
import { STREAMING_PLATFORM_ORDER, streamingPlatformRank } from "@/lib/labels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export type StreamingLink = { id: string; platform: string; url: string };

export function StreamingLinksDialog({
  songId,
  songTitle,
  links,
}: {
  songId: string;
  songTitle: string;
  links: StreamingLink[];
}) {
  const [open, setOpen] = useState(false);
  const datalistId = useId();

  const sorted = [...links].sort(
    (a, b) => streamingPlatformRank(a.platform) - streamingPlatformRank(b.platform),
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Streaming linkek"
          className="relative"
        >
          <Link2 className="h-4 w-4" />
          {links.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
              {links.length}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Streaming linkek</DialogTitle>
          <DialogDescription>{songTitle}</DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {sorted.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Még nincs streaming link rögzítve.
            </p>
          )}
          {sorted.map((link) => (
            <div
              key={link.id}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              <div className="min-w-0 flex-1">
                <div className="font-medium">{link.platform}</div>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-xs text-primary underline-offset-4 hover:underline"
                >
                  <span className="truncate">{link.url}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
              <form action={deleteStreamingLink}>
                <input type="hidden" name="id" value={link.id} />
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
          action={addStreamingLink}
          className="flex flex-wrap items-end gap-2 border-t pt-3"
        >
          <input type="hidden" name="songId" value={songId} />
          <div className="w-36 space-y-1">
            <label className="text-xs font-medium" htmlFor={`sl-platform-${songId}`}>
              Platform
            </label>
            <Input
              id={`sl-platform-${songId}`}
              name="platform"
              list={datalistId}
              required
              placeholder="pl. Spotify"
              className="h-8"
            />
            <datalist id={datalistId}>
              {STREAMING_PLATFORM_ORDER.map((p) => (
                <option key={p} value={p} />
              ))}
            </datalist>
          </div>
          <div className="min-w-40 flex-1 space-y-1">
            <label className="text-xs font-medium" htmlFor={`sl-url-${songId}`}>
              Link
            </label>
            <Input
              id={`sl-url-${songId}`}
              name="url"
              type="url"
              required
              placeholder="https://open.spotify.com/…"
              className="h-8"
            />
          </div>
          <Button type="submit" size="sm">
            Hozzáad
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
