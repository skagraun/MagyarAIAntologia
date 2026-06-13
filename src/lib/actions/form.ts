/** Segédfüggvények FormData értékek tisztításához a server action-ökben. */

export function str(formData: FormData, key: string): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  return trimmed === "" ? null : trimmed;
}

export function requiredStr(formData: FormData, key: string): string {
  return str(formData, key) ?? "";
}

export function int(formData: FormData, key: string): number | null {
  const v = str(formData, key);
  if (v === null) return null;
  const n = Number.parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}

export function bool(formData: FormData, key: string): boolean {
  const v = formData.get(key);
  return v === "on" || v === "true" || v === "1";
}

/** date input -> "YYYY-MM-DD" vagy null. */
export function dateStr(formData: FormData, key: string): string | null {
  return str(formData, key);
}
