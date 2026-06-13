import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** YouTube videó URL a videó azonosítóból. */
export function youtubeUrl(ytId: string): string {
  return `https://www.youtube.com/watch?v=${ytId}`;
}

/**
 * Borító URL. Ha van saját feltöltött kép, azt használjuk;
 * különben a YouTube thumbnailt a videó ID-ből (hqdefault: 480x360).
 */
export function coverUrl(opts: {
  coverImageUrl?: string | null;
  ytId?: string | null;
}): string | null {
  if (opts.coverImageUrl) return opts.coverImageUrl;
  if (opts.ytId) return `https://i.ytimg.com/vi/${opts.ytId}/hqdefault.jpg`;
  return null;
}

/**
 * Megpróbál YouTube videó ID-t kinyerni akár nyers ID-ből, akár teljes linkből
 * (watch?v=, youtu.be/, shorts/, embed/). Ha nem talál, az eredetit adja vissza trimelve.
 */
export function parseYoutubeId(input: string): string {
  const value = input.trim();
  if (!value) return "";
  // Nyers 11 karakteres ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  const patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /\/shorts\/([a-zA-Z0-9_-]{11})/,
    /\/embed\/([a-zA-Z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = value.match(re);
    if (m) return m[1];
  }
  return value;
}

/** Magyar dátumformázás (pl. 2026. 06. 13.). */
export function formatHuDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("hu-HU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}
