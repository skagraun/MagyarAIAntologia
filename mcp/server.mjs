#!/usr/bin/env node
/**
 * Magyar AI Antológia — read-only MCP szerver.
 *
 * Ugyanahhoz a Neon Postgres adatbázishoz csatlakozik, mint a webes app,
 * és CSAK olvasó eszközöket ad ki Claude Desktopnak. Így a MacBookon futó
 * Claude projektből látható az aktuális adatbázis (dalok, kívánságlista,
 * ötletek, lejátszási listák), anélkül hogy két helyre kellene rögzíteni.
 *
 * Indítás: DATABASE_URL=... node server.mjs   (stdio transport)
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import pg from "pg";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("Hiányzik a DATABASE_URL környezeti változó.");
  process.exit(1);
}

// Neon felé SSL kell. A connection string-ben gyakran benne van ?sslmode=require.
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 2,
});

async function q(text, params = []) {
  const client = await pool.connect();
  try {
    // Védőháló: a session csak olvasásra képes ezen a kapcsolaton.
    await client.query("SET TRANSACTION READ ONLY");
    const res = await client.query(text, params);
    return res.rows;
  } finally {
    client.release();
  }
}

function jsonResult(data) {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
  };
}

const SELECT_ONLY = /^\s*select\b/i;
const FORBIDDEN = /\b(insert|update|delete|drop|alter|create|truncate|grant|revoke|copy)\b/i;

const tools = [
  {
    name: "list_songs",
    description:
      "Dalok listája (publikált és bemutató előtt álló): sorszám, szerző, cím, stílus, YT ID, megjelenés, megjelent állapot, lejátszási listák.",
    inputSchema: {
      type: "object",
      properties: {
        published: {
          type: "boolean",
          description:
            "Ha megadod, csak a megjelent (true) vagy csak a bemutató előtti (false) dalok.",
        },
      },
    },
    run: async (args) => {
      const where =
        typeof args?.published === "boolean"
          ? "WHERE s.published = $1"
          : "";
      const params =
        typeof args?.published === "boolean" ? [args.published] : [];
      const rows = await q(
        `SELECT s.track_number, s.author, s.title, s.style, s.yt_id,
                s.release_date, s.published, s.cover_image_url,
                COALESCE(
                  array_agg(p.name ORDER BY p.sort_order)
                    FILTER (WHERE p.id IS NOT NULL),
                  '{}'
                ) AS playlists
         FROM songs s
         LEFT JOIN song_playlists sp ON sp.song_id = s.id
         LEFT JOIN playlists p ON p.id = sp.playlist_id
         ${where}
         GROUP BY s.id
         ORDER BY s.track_number NULLS LAST, s.created_at`,
        params,
      );
      return jsonResult(rows);
    },
  },
  {
    name: "list_wishlist",
    description:
      "Kívánságlista: ki kérte, mikor, szerző, cím, elkészíthető?, publikálás dátuma, YT ID.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const rows = await q(
        `SELECT requested_by, requested_at, author, title, feasible,
                published_date, yt_id, created_at
         FROM wishlist
         ORDER BY created_at DESC`,
      );
      return jsonResult(rows);
    },
  },
  {
    name: "list_ideas",
    description: "Ötletek a további dalokhoz: előadó, cím, elkészíthető?.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const rows = await q(
        `SELECT performer, title, feasible, created_at
         FROM ideas
         ORDER BY created_at DESC`,
      );
      return jsonResult(rows);
    },
  },
  {
    name: "list_playlists",
    description:
      "Lejátszási listák emojival és a hozzájuk tartozó dalok számával.",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const rows = await q(
        `SELECT p.emoji, p.name, p.sort_order, count(sp.song_id)::int AS song_count
         FROM playlists p
         LEFT JOIN song_playlists sp ON sp.playlist_id = p.id
         GROUP BY p.id
         ORDER BY p.sort_order, p.name`,
      );
      return jsonResult(rows);
    },
  },
  {
    name: "list_working_titles",
    description:
      "Suno munkacím-napló dalonként (eldobva/végleges/munka alatt állapottal).",
    inputSchema: { type: "object", properties: {} },
    run: async () => {
      const rows = await q(
        `SELECT s.track_number, s.author, s.title AS song_title,
                wt.title AS working_title, wt.status, wt.note
         FROM song_working_titles wt
         JOIN songs s ON s.id = wt.song_id
         ORDER BY s.track_number NULLS LAST, wt.created_at`,
      );
      return jsonResult(rows);
    },
  },
  {
    name: "run_select",
    description:
      "Tetszőleges READ-ONLY SQL SELECT lekérdezés futtatása az adatbázison. Csak SELECT engedélyezett; módosító parancsok tiltottak.",
    inputSchema: {
      type: "object",
      properties: {
        sql: { type: "string", description: "Egy SELECT lekérdezés." },
      },
      required: ["sql"],
    },
    run: async (args) => {
      const sql = String(args?.sql ?? "");
      if (!SELECT_ONLY.test(sql) || FORBIDDEN.test(sql)) {
        throw new Error("Csak egyetlen, módosítás nélküli SELECT engedélyezett.");
      }
      const rows = await q(sql);
      return jsonResult(rows);
    },
  },
];

const server = new Server(
  { name: "magyar-ai-antologia", version: "0.1.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map(({ name, description, inputSchema }) => ({
    name,
    description,
    inputSchema,
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = tools.find((t) => t.name === request.params.name);
  if (!tool) {
    throw new Error(`Ismeretlen eszköz: ${request.params.name}`);
  }
  try {
    return await tool.run(request.params.arguments ?? {});
  } catch (err) {
    return {
      isError: true,
      content: [
        { type: "text", text: `Hiba: ${err instanceof Error ? err.message : String(err)}` },
      ],
    };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("Magyar AI Antológia MCP szerver fut (read-only, stdio).");
