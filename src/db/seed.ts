/**
 * Kezdeti adatfeltöltés a kötet-tracker alapján (2026.06.13 állapot).
 * Idempotens: ha már van dal az adatbázisban, nem csinál semmit.
 *
 * Futtatás:  npm run db:seed   (előbb db:push vagy db:migrate kell)
 */
import { config } from "dotenv";
// A Vercel CLI alapból .env.development.local-ba húzza az env-et.
config({ path: ".env.development.local" });
config({ path: ".env.local" });
config({ path: ".env" });

import { sql } from "drizzle-orm";
import { db } from "./index";
import {
  songs,
  playlists,
  songPlaylists,
  songWorkingTitles,
} from "./schema";

type WtSeed = { title: string; status: "draft" | "final" | "discarded" };

type SongSeed = {
  n: number;
  author: string;
  title: string;
  style: string;
  ytId: string | null;
  release: string | null;
  published: boolean;
  playlists: string[]; // emoji kulcsok
  workingTitles?: WtSeed[];
};

const PLAYLISTS = [
  { emoji: "⚔️", name: "Pagan Folk Metal", sortOrder: 1 },
  { emoji: "🇭🇺", name: "Petőfi Sándor", sortOrder: 2 },
  { emoji: "📜", name: "Arany János", sortOrder: 3 },
  { emoji: "🔥", name: "1848–49 szabadságharc", sortOrder: 4 },
  { emoji: "🪕", name: "Magyar népdalok", sortOrder: 5 },
  { emoji: "🎸", name: "Vintage Hungarian Rock", sortOrder: 6 },
];

const SONGS: SongSeed[] = [
  { n: 1, author: "Arany János", title: "Toldi", style: "Pagan Folk Metal", ytId: "FJ3q2fYrTAs", release: null, published: true, playlists: ["⚔️", "📜"] },
  { n: 2, author: "Magyar népdal", title: "Szél viszi", style: "Cinematic Folk Doom", ytId: "npebt7sU8sk", release: null, published: true, playlists: ["🪕"] },
  { n: 3, author: "Pósa Lajos", title: "(Pósa-vers)", style: "Pagan Folk Metal", ytId: "eQ6Ml5F8U3s", release: null, published: true, playlists: ["⚔️"] },
  { n: 4, author: "(történelmi)", title: "Trianon", style: "Cinematic Post-Classical", ytId: "mR1lt-OGMSY", release: null, published: true, playlists: ["🔥"], workingTitles: [{ title: "Ezer év könnyei", status: "draft" }] },
  { n: 5, author: "Petőfi Sándor", title: "A nép nevében", style: "Symphonic Folk Metal", ytId: "oSlwHLI6ztQ", release: null, published: true, playlists: ["⚔️", "🇭🇺"] },
  { n: 6, author: "(történelmi)", title: "Gábor Áron", style: "Pagan Folk Metal", ytId: "3mgxd4ucl4g", release: null, published: true, playlists: ["⚔️", "🔥"] },
  { n: 7, author: "(történelmi)", title: "Arad", style: "Sacred Choral", ytId: "45rZ1RT5nLc", release: null, published: true, playlists: ["🔥"] },
  { n: 8, author: "Erkel Ferenc", title: "Hazám hazám", style: "Cinematic Operatic", ytId: "14Ev7JxzCcc", release: "2026-05-04", published: true, playlists: ["⚔️"] },
  { n: 9, author: "Petőfi Sándor", title: "Csatadal", style: "Pagan Folk Metal", ytId: "f_ezjKUF64o", release: "2026-05-04", published: true, playlists: ["⚔️", "🇭🇺", "🔥"], workingTitles: [{ title: "Trombita harsog", status: "draft" }] },
  { n: 10, author: "Tóth Árpád", title: "Esti sugárkoszorú", style: "Ambient Cinematic Sacred", ytId: "TeL32Y3z1mw", release: "2026-05-05", published: true, playlists: [], workingTitles: [{ title: "Zuhogó mély zene", status: "draft" }] },
  { n: 11, author: "Petőfi Sándor", title: "Pató Pál úr", style: "Vintage Hungarian Rock", ytId: "g0hBe2m0pOg", release: "2026-05-07", published: true, playlists: ["🎸", "🇭🇺"] },
  { n: 12, author: "Arany János", title: "Ágnes asszony /1–19. strófa/", style: "Cinematic Folk Doom", ytId: "tlucWDGP9Mo", release: "2026-05-08", published: true, playlists: ["📜"] },
  { n: 13, author: "Magyar népdal", title: "A csitári hegyek alatt", style: "Pagan Folk Metal", ytId: "LhD-q5qOxrg", release: "2026-05-09", published: true, playlists: ["⚔️", "🪕"], workingTitles: [{ title: "Jéghegyes kisangyalom", status: "discarded" }, { title: "Csitári hóesés", status: "final" }] },
  { n: 14, author: "Petőfi Sándor", title: "Egy gondolat bánt engemet", style: "Vintage Hungarian Rock", ytId: "oe9WtWKb3Ak", release: "2026-05-10", published: true, playlists: ["🎸", "🇭🇺"], workingTitles: [{ title: "Ágyban Halál", status: "discarded" }, { title: "Vörös tigris villámfutás", status: "discarded" }, { title: "Vörös tigris éjjel", status: "final" }] },
  { n: 15, author: "Arany János", title: "V. László", style: "Pagan Folk Metal", ytId: "piRaobirbaU", release: "2026-05-11", published: true, playlists: ["⚔️", "📜"] },
  { n: 16, author: "Vörösmarty Mihály", title: "A vén cigány", style: "Pagan Folk Metal", ytId: "WCB6QvpuxHw", release: "2026-05-11", published: true, playlists: ["⚔️"], workingTitles: [{ title: "Vontatott kupák", status: "draft" }] },
  { n: 17, author: "Magyar népdal", title: "Százados úr, sej-haj", style: "Vintage Hungarian Rock", ytId: "Qh0WpMQl0No", release: "2026-05-13", published: true, playlists: ["🎸", "🪕"] },
  { n: 18, author: "Juhász Gyula", title: "Anna örök", style: "Ambient Cinematic Sacred", ytId: "myR8Wpn7vzg", release: "2026-05-14", published: true, playlists: [], workingTitles: [{ title: "Elszürkült ábrázat", status: "draft" }] },
  { n: 19, author: "Petőfi Sándor", title: "Ha férfi vagy, légy férfi", style: "Pagan Folk Metal", ytId: "icdqxyjTgQY", release: "2026-05-14", published: true, playlists: ["⚔️", "🇭🇺"], workingTitles: [{ title: "Koldusbot függetlenség", status: "draft" }] },
  { n: 20, author: "Pósa Lajos", title: "Verje meg az Isten", style: "Vintage Hungarian Rock", ytId: null, release: null, published: false, playlists: ["🎸"] },
  { n: 21, author: "(?)", title: "A magyar nemes", style: "Pagan Folk Metal", ytId: null, release: null, published: false, playlists: ["⚔️"] },
  { n: 22, author: "Magyar népdal", title: "Megismerni a kanászt", style: "Vintage Hungarian Rock", ytId: "g47FllcbrEQ", release: "2026-05-30", published: true, playlists: ["🎸", "🪕"] },
  { n: 23, author: "Petőfi Sándor", title: "Falu végén kurta kocsma", style: "Pagan Folk Metal", ytId: "TszbR0O1EHQ", release: "2026-06-01", published: true, playlists: ["⚔️", "🇭🇺"], workingTitles: [{ title: "Cimbalmos Szamos", status: "discarded" }, { title: "Komp sötétség", status: "final" }] },
  { n: 24, author: "Papp-Váry Elemérné", title: "Hitvallás (Magyar Hiszekegy)", style: "Pagan Folk Metal", ytId: "hZZoWtPH6r8", release: "2026-06-04", published: true, playlists: ["⚔️"], workingTitles: [{ title: "Földbe Írt Hit", status: "final" }] },
  { n: 25, author: "Szendrey Júlia", title: "Keserű kín", style: "Cinematic Folk Doom", ytId: "xV2hd8HhGys", release: "2026-06-06", published: true, playlists: [], workingTitles: [{ title: "Keserű kísértet", status: "final" }] },
  { n: 26, author: "Thaly K. / Egressy B.", title: "Föl, föl vitézek (Klapka-induló)", style: "Pagan Folk Metal", ytId: "E6IhRQKwt9E", release: "2026-06-08", published: true, playlists: ["⚔️", "🔥"], workingTitles: [{ title: "Komárom Gulyásvér", status: "final" }] },
  { n: 27, author: "Vörösmarty Mihály", title: "Petike", style: "Classic Heavy Metal", ytId: "a0T0hodQOz0", release: "2026-06-12", published: false, playlists: ["🎸"] },
];

async function main() {
  const [{ c }] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(songs);
  if (c > 0) {
    console.log(`Az adatbázisban már van ${c} dal — a seed kihagyva.`);
    return;
  }

  // Lejátszási listák
  const insertedPlaylists = await db
    .insert(playlists)
    .values(PLAYLISTS)
    .returning({ id: playlists.id, emoji: playlists.emoji });
  const playlistByEmoji = new Map(
    insertedPlaylists.map((p) => [p.emoji ?? "", p.id]),
  );

  // Dalok + kapcsolatok
  for (const s of SONGS) {
    const [created] = await db
      .insert(songs)
      .values({
        trackNumber: s.n,
        author: s.author,
        title: s.title,
        style: s.style,
        ytId: s.ytId,
        releaseDate: s.release,
        published: s.published,
      })
      .returning({ id: songs.id });

    const links = s.playlists
      .map((emoji) => playlistByEmoji.get(emoji))
      .filter((id): id is string => Boolean(id))
      .map((playlistId) => ({ songId: created.id, playlistId }));
    if (links.length > 0) {
      await db.insert(songPlaylists).values(links);
    }

    if (s.workingTitles?.length) {
      await db.insert(songWorkingTitles).values(
        s.workingTitles.map((wt) => ({
          songId: created.id,
          title: wt.title,
          status: wt.status,
        })),
      );
    }
  }

  console.log(
    `Kész: ${PLAYLISTS.length} lejátszási lista és ${SONGS.length} dal betöltve.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
