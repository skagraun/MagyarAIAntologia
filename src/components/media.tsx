import { ExternalLink, ImageOff } from "lucide-react";
import { youtubeUrl } from "@/lib/utils";

/** Kattintható YouTube link a videó azonosítóból. */
export function YoutubeLink({
  ytId,
  label,
}: {
  ytId: string | null | undefined;
  label?: string;
}) {
  if (!ytId) return <span className="text-muted-foreground">—</span>;
  return (
    <a
      href={youtubeUrl(ytId)}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
    >
      {label ?? "Megnyitás"}
      <ExternalLink className="h-3.5 w-3.5" />
    </a>
  );
}

/** Borító-bélyegkép. URL hiányában placeholder. */
export function Cover({
  src,
  alt,
  className = "h-12 w-20",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded bg-muted text-muted-foreground ${className}`}
      >
        <ImageOff className="h-4 w-4" />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`rounded object-cover ${className}`}
      loading="lazy"
    />
  );
}
