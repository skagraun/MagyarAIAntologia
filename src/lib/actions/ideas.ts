"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { ideas, type feasibility } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { str } from "./form";
import type { ActionState } from "./types";

type Feasible = (typeof feasibility.enumValues)[number];
const IDEAS_PATH = "/otletek";

export async function saveIdea(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireUser();

  const id = str(formData, "id");
  const title = str(formData, "title");
  if (!title) {
    return { ok: false, fieldErrors: { title: ["A cím megadása kötelező."] } };
  }

  const values = {
    performer: str(formData, "performer"),
    title,
    feasible: (str(formData, "feasible") as Feasible | null) ?? "maybe",
    updatedAt: new Date(),
  };

  if (id) {
    await db.update(ideas).set(values).where(eq(ideas.id, id));
  } else {
    await db.insert(ideas).values(values);
  }

  revalidatePath(IDEAS_PATH);
  return { ok: true };
}

export async function deleteIdea(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  if (id) {
    await db.delete(ideas).where(eq(ideas.id, id));
    revalidatePath(IDEAS_PATH);
  }
}

/** Ötletből kívánságlista/dal lesz — gyors „elkészíthető" váltás. */
export async function setIdeaFeasible(formData: FormData): Promise<void> {
  await requireUser();
  const id = str(formData, "id");
  const feasible = str(formData, "feasible") as Feasible | null;
  if (id && feasible) {
    await db
      .update(ideas)
      .set({ feasible, updatedAt: new Date() })
      .where(eq(ideas.id, id));
    revalidatePath(IDEAS_PATH);
  }
}
