"use client";

import Link from "next/link";
import { useActionState } from "react";
import { register } from "@/lib/auth/actions";
import { initialActionState } from "@/lib/actions/types";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  const [state, formAction] = useActionState(register, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Regisztráció</CardTitle>
        <CardDescription>
          A regisztráció meghívókódhoz kötött.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Név</Label>
            <Input id="name" name="name" autoComplete="name" required />
            {state.fieldErrors?.name && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.name[0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
            />
            {state.fieldErrors?.email && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.email[0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Jelszó</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="inviteCode">Meghívókód</Label>
            <Input id="inviteCode" name="inviteCode" required />
            {state.fieldErrors?.inviteCode && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.inviteCode[0]}
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton className="w-full" pendingText="Fiók létrehozása…">
            Fiók létrehozása
          </SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Van már fiókod?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Bejelentkezés
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
