# 🎼 Magyar AI Antológia — Csatorna-menedzser

A *Magyar AI Antológia* YouTube csatorna dalainak, kívánságlistájának és
ötleteinek kezelése. Next.js (App Router) + shadcn/ui + Neon Postgres + Drizzle,
email + jelszó alapú, **zárt (meghívásos)** hozzáféréssel. Vercelre telepíthető.

## Funkciók

1. **Dalok** — publikált és bemutató előtt álló dalok: sorszám, szerző, cím,
   stílus, YouTube ID (kattintható link), megjelenés dátuma, „megjelent?",
   borító (YT thumbnailből automatikus **vagy** saját feltöltés), lejátszási
   listák (M:N), valamint dalonkénti **Suno munkacím-napló**.
2. **Kívánságlista** — ki kérte, mikor, szerző, cím, elkészíthető?, publikálás
   dátuma, YouTube link.
3. **Ötletek** — előadó, cím, elkészíthető?.
4. **Lejátszási listák** — emojis tematikus listák kezelése.
5. **Meghívók** (admin) — zárt regisztrációhoz kódok kibocsátása.
6. **MCP szerver** — a MacBookos Claude Desktop ugyanazt az adatbázist **olvashatja**
   (lásd lent), így nem kell két helyre rögzíteni.

## Tech stack

- **Next.js 15** (App Router, server actions — csak a szükséges szerverlogika)
- **shadcn/ui** komponensek (Tailwind v4)
- **Neon Postgres** + **Drizzle ORM**
- Saját **session-auth** (`jose` aláírt cookie + `bcryptjs` jelszó-hash)
- **Vercel Blob** a feltöltött borítókhoz

## Helyi fejlesztés

```bash
npm install
cp .env.example .env.local   # töltsd ki az értékeket
npm run db:push              # séma létrehozása a Neon adatbázisban
npm run db:seed              # (opcionális) kötet-tracker adatok betöltése
npm run dev
```

Megnyitás: http://localhost:3000

### Környezeti változók (`.env.local`)

| Változó | Leírás |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (`?sslmode=require`) |
| `SESSION_SECRET` | Session aláíró titok, min. 32 karakter (`openssl rand -base64 32`) |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob token a borítófeltöltéshez |
| `BOOTSTRAP_INVITE_CODE` | Az **első** (admin) fiók regisztrációjához használt kód |

### Első bejelentkezés

1. Állítsd be a `BOOTSTRAP_INVITE_CODE`-ot a `.env.local`-ban.
2. Nyisd meg a `/register` oldalt, és ezzel a kóddal hozd létre az első fiókot
   — ez automatikusan **admin** lesz.
3. Admin a *Meghívók* oldalon hozhat létre kódokat a többi szerkesztőnek.

## Telepítés Vercelre

1. Hozz létre egy Vercel projektet a repóból.
2. **Storage → Neon**: hozd létre az adatbázist; a `DATABASE_URL` automatikusan
   bekerül a környezeti változók közé.
3. **Storage → Blob**: hozd létre a tárolót; a `BLOB_READ_WRITE_TOKEN` is
   automatikusan bekerül.
4. Add hozzá a `SESSION_SECRET` és `BOOTSTRAP_INVITE_CODE` változókat.
5. Az első deploy után futtasd a sémamigrációt:
   `npm run db:push` (helyileg, a Vercel `DATABASE_URL`-lel), vagy a
   `npm run db:migrate` parancsot a generált migrációkkal.

## Drizzle parancsok

| Parancs | Leírás |
|---|---|
| `npm run db:generate` | SQL migráció generálása a sémából |
| `npm run db:migrate` | Migrációk lefuttatása |
| `npm run db:push` | Séma közvetlen szinkronizálása (fejlesztéshez) |
| `npm run db:studio` | Drizzle Studio (böngészős adatnézegető) |
| `npm run db:seed` | Kezdeti adatok betöltése a kötet-trackerből |

## MCP — adatbázis olvasása Claude Desktopból

A `mcp/` mappában egy **read-only** MCP szerver van, ami ugyanahhoz a Neon
adatbázishoz csatlakozik, és olvasó eszközöket ad Claude Desktopnak
(`list_songs`, `list_wishlist`, `list_ideas`, `list_playlists`,
`list_working_titles`, `run_select`). Részletek: [`mcp/README.md`](mcp/README.md).
