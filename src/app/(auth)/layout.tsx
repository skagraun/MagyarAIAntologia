import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Ha már be van jelentkezve, ne mutassuk a login/register oldalt.
  const user = await getCurrentUser();
  if (user) redirect("/");

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="text-3xl">🎼</div>
          <h1 className="mt-2 text-xl font-semibold">Magyar AI Antológia</h1>
          <p className="text-sm text-muted-foreground">Csatorna-menedzser</p>
        </div>
        {children}
      </div>
    </div>
  );
}
