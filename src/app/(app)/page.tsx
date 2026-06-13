import Link from "next/link";
import { sql } from "drizzle-orm";
import { Music4, Heart, Lightbulb, ListMusic } from "lucide-react";
import { db } from "@/db";
import { songs, wishlist, ideas, playlists } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

async function count(table: typeof songs | typeof wishlist | typeof ideas | typeof playlists) {
  const [row] = await db.select({ c: sql<number>`count(*)::int` }).from(table);
  return row?.c ?? 0;
}

export default async function DashboardPage() {
  const [songCount, publishedCount, wishCount, ideaCount, playlistCount] =
    await Promise.all([
      count(songs),
      db
        .select({ c: sql<number>`count(*)::int` })
        .from(songs)
        .where(sql`${songs.published} = true`)
        .then((r) => r[0]?.c ?? 0),
      count(wishlist),
      count(ideas),
      count(playlists),
    ]);

  const cards = [
    {
      href: "/dalok",
      icon: Music4,
      title: "Dalok",
      value: songCount,
      desc: `${publishedCount} megjelent · ${songCount - publishedCount} bemutató előtt`,
    },
    {
      href: "/kivansaglista",
      icon: Heart,
      title: "Kívánságlista",
      value: wishCount,
      desc: "Beérkezett kérések",
    },
    {
      href: "/otletek",
      icon: Lightbulb,
      title: "Ötletek",
      value: ideaCount,
      desc: "További dalötletek",
    },
    {
      href: "/listak",
      icon: ListMusic,
      title: "Lejátszási listák",
      value: playlistCount,
      desc: "Tematikus listák",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Áttekintés</h1>
        <p className="text-sm text-muted-foreground">
          Magyar AI Antológia — csatorna-menedzser
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <Link key={c.href} href={c.href}>
              <Card className="transition-colors hover:bg-accent/50">
                <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {c.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{c.value}</div>
                  <CardDescription className="mt-1">{c.desc}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
