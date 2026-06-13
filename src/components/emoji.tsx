/**
 * Emoji megjelenítő, ami a zászló-emojikat (regionális jelző párok, pl. 🇭🇺)
 * valódi zászló-képként rendereli — mert a Windows ezeket csak betűpárként
 * ("HU") mutatja. Minden más emojit szövegként ad vissza.
 */

/** Zászló-emojiból ISO 3166 országkód (pl. 🇭🇺 -> "hu"), vagy null ha nem zászló. */
function flagIso(value: string): string | null {
  const chars = Array.from(value.trim());
  if (chars.length !== 2) return null;
  const BASE = 0x1f1e6; // 'A' regionális jelző
  const LAST = 0x1f1ff; // 'Z'
  const codes = chars.map((c) => c.codePointAt(0) ?? 0);
  if (codes.some((cp) => cp < BASE || cp > LAST)) return null;
  return codes.map((cp) => String.fromCharCode(cp - BASE + 97)).join("");
}

export function Emoji({
  value,
  className,
}: {
  value: string | null | undefined;
  className?: string;
}) {
  if (!value) return null;
  const iso = flagIso(value);
  if (iso) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`https://flagcdn.com/${iso}.svg`}
        alt={value}
        className={className}
        style={{
          height: "1em",
          width: "auto",
          display: "inline-block",
          verticalAlign: "-0.15em",
          borderRadius: "2px",
        }}
        loading="lazy"
      />
    );
  }
  return <span className={className}>{value}</span>;
}
