import "server-only";
import { put } from "@vercel/blob";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/**
 * Borítókép feltöltése a Vercel Blob tárolóba. Visszaadja a publikus URL-t,
 * vagy null-t, ha nincs feltöltött fájl. Hibát dob érvénytelen fájlnál.
 */
export async function uploadCover(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED.includes(file.type)) {
    throw new Error("Csak JPG, PNG, WebP vagy AVIF kép tölthető fel.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("A kép legfeljebb 5 MB lehet.");
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(
      "Hiányzik a BLOB_READ_WRITE_TOKEN — borítófeltöltéshez állítsd be a Vercel Blob tárolót.",
    );
  }

  const ext = file.type.split("/")[1] ?? "jpg";
  const blob = await put(`covers/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    contentType: file.type,
  });

  return blob.url;
}
