import type { BadgeProps } from "@/components/ui/badge";

type Feasible = "yes" | "no" | "maybe";
type WtStatus = "draft" | "final" | "discarded";

export const feasibleLabel: Record<Feasible, string> = {
  yes: "Igen",
  no: "Nem",
  maybe: "Talán",
};

export const feasibleVariant: Record<Feasible, BadgeProps["variant"]> = {
  yes: "success",
  no: "destructive",
  maybe: "warning",
};

export const workingTitleLabel: Record<WtStatus, string> = {
  draft: "Munka alatt",
  final: "Végleges",
  discarded: "Eldobva",
};

export const workingTitleVariant: Record<WtStatus, BadgeProps["variant"]> = {
  draft: "secondary",
  final: "success",
  discarded: "outline",
};

/** Gyakori streaming platformok — sorrend a megjelenítéshez, névsor a datalisthez. */
export const STREAMING_PLATFORM_ORDER = [
  "Spotify",
  "Apple Music",
  "YouTube Music",
  "Amazon Music",
  "Deezer",
  "Tidal",
  "SoundCloud",
];

/** Rendezési index egy platformnévhez — ismeretlen platform a lista végére kerül, ábécésorrendben. */
export function streamingPlatformRank(platform: string): number {
  const idx = STREAMING_PLATFORM_ORDER.indexOf(platform);
  return idx === -1 ? STREAMING_PLATFORM_ORDER.length : idx;
}
