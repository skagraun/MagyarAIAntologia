/** Egységes visszatérési típus a form server action-ökhöz (useActionState). */
export type ActionState = {
  ok: boolean;
  error?: string;
  /** Mezőnkénti hibák, ha zod validáció bukik. */
  fieldErrors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { ok: false };
