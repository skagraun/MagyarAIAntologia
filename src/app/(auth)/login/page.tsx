"use client";

import Link from "next/link";
import { useActionState } from "react";
import { login } from "@/lib/auth/actions";
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

export default function LoginPage() {
  const [state, formAction] = useActionState(login, initialActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bejelentkezés</CardTitle>
        <CardDescription>Add meg az email címed és a jelszavad.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
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
              autoComplete="current-password"
              required
            />
            {state.fieldErrors?.password && (
              <p className="text-xs text-destructive">
                {state.fieldErrors.password[0]}
              </p>
            )}
          </div>

          {state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}

          <SubmitButton className="w-full" pendingText="Belépés…">
            Belépés
          </SubmitButton>
        </form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Van meghívókódod?{" "}
          <Link href="/register" className="font-medium text-primary underline-offset-4 hover:underline">
            Regisztráció
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
