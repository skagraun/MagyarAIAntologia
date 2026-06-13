"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Music4, Heart, Lightbulb, ListMusic, Mail, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/auth/actions";

const links = [
  { href: "/dalok", label: "Dalok", icon: Music4 },
  { href: "/kivansaglista", label: "Kívánságlista", icon: Heart },
  { href: "/otletek", label: "Ötletek", icon: Lightbulb },
  { href: "/listak", label: "Lejátszási listák", icon: ListMusic },
];

export function Nav({
  user,
}: {
  user: { name: string; role: "admin" | "editor" };
}) {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-lg">🎼</span>
          <span className="hidden sm:inline">Magyar AI Antológia</span>
        </Link>

        <nav className="flex flex-1 flex-wrap items-center gap-1">
          {links.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden md:inline">{link.label}</span>
              </Link>
            );
          })}
          {user.role === "admin" && (
            <Link
              href="/admin/meghivok"
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith("/admin")
                  ? "bg-secondary text-secondary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Mail className="h-4 w-4" />
              <span className="hidden md:inline">Meghívók</span>
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <span className="hidden text-sm text-muted-foreground sm:inline">
            {user.name}
          </span>
          <form action={logout}>
            <Button variant="ghost" size="sm" type="submit" title="Kijelentkezés">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Kilépés</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
