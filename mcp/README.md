# Magyar AI Antológia — MCP szerver (read-only)

Ez a kis MCP szerver ugyanahhoz a **Neon Postgres** adatbázishoz csatlakozik,
mint a webes app, és **csak olvasó** eszközöket ad ki a Claude Desktopnak.
Így a MacBookon futó Claude projektből (ahol a dalok készülnek) közvetlenül
látható az aktuális adatbázis — nem kell két helyre rögzíteni a változásokat.

A kapcsolaton minden lekérdezés `SET TRANSACTION READ ONLY` alatt fut, és a
`run_select` eszköz csak egyetlen `SELECT`-et enged (módosító parancsok tiltva).

## Eszközök

| Eszköz | Mit ad vissza |
|---|---|
| `list_songs` | Dalok (opcionális `published` szűrővel), listákkal együtt |
| `list_wishlist` | Kívánságlista |
| `list_ideas` | Ötletek |
| `list_playlists` | Lejátszási listák + dalszám |
| `list_working_titles` | Suno munkacím-napló dalonként |
| `run_select` | Tetszőleges read-only `SELECT` |

## Telepítés (MacBook)

```bash
cd mcp
npm install
```

## Beállítás Claude Desktopban

Szerkeszd a Claude Desktop konfigot:

- **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

Add hozzá (a `DATABASE_URL` a Vercel/Neon connection string — ugyanaz, mint az appé;
javasolt egy **csak-olvasó** Neon szerepkör használata):

```json
{
  "mcpServers": {
    "magyar-ai-antologia": {
      "command": "node",
      "args": ["/ABSZOLUT/UT/Magyar AI Antológia/mcp/server.mjs"],
      "env": {
        "DATABASE_URL": "postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
      }
    }
  }
}
```

A `/ABSZOLUT/UT/...` helyére a `mcp/server.mjs` tényleges abszolút elérési útja
kerül. Mentés után indítsd újra a Claude Desktopot — az eszközök a 🔌 ikonnál
jelennek meg.

> 💡 **Tipp – csak-olvasó hozzáférés:** a Neon konzolban hozz létre egy külön
> read-only role-t, és annak a connection stringjét add meg itt. Így a Claude
> Desktop biztosan nem tud módosítani semmit.

## Helyi próba

```bash
DATABASE_URL="postgresql://..." node server.mjs
```

(stdio-n kommunikál; normál esetben a Claude Desktop indítja.)
