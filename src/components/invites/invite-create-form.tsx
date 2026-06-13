"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { createInvite } from "@/lib/actions/invites";
import { initialActionState } from "@/lib/actions/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InviteCreateForm() {
  const [state, formAction] = useActionState(createInvite, initialActionState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success("Meghívókód létrehozva.");
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Új meghívó</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          ref={formRef}
          action={formAction}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email korlátozás (opcionális)</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="csak.ez@example.com"
              className="w-64"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="expiresInDays">Lejárat (nap, opcionális)</Label>
            <Input
              id="expiresInDays"
              name="expiresInDays"
              type="number"
              min={1}
              placeholder="pl. 14"
              className="w-40"
            />
          </div>
          <SubmitButton pendingText="Létrehozás…">Meghívó létrehozása</SubmitButton>
          {state.error && (
            <p className="w-full text-sm text-destructive">{state.error}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
