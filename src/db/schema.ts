import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  date,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Enumok
// ---------------------------------------------------------------------------

/** Felhasználói szerepkör. Az admin tud meghívót kibocsátani és fiókot kezelni. */
export const userRole = pgEnum("user_role", ["admin", "editor"]);

/** "Elkészíthető?" háromállapotú jelző a kívánságlistán és az ötleteknél. */
export const feasibility = pgEnum("feasibility", ["yes", "no", "maybe"]);

/** Suno munkacím állapota a kreatív naplóban. */
export const workingTitleStatus = pgEnum("working_title_status", [
  "draft", // egyéb / rögzítésre vár
  "final", // végleges
  "discarded", // eldobva
]);

// ---------------------------------------------------------------------------
// Felhasználók + meghívók (zárt, meghívásos regisztráció)
// ---------------------------------------------------------------------------

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: userRole("role").notNull().default("editor"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Meghívókódok. Csak érvényes, fel nem használt kóddal lehet regisztrálni.
 * Az `email` opcionálisan egy konkrét címre korlátozza a kódot.
 */
export const inviteCodes = pgTable("invite_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  email: text("email"),
  createdByUserId: uuid("created_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  usedByUserId: uuid("used_by_user_id").references(() => users.id, {
    onDelete: "set null",
  }),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 1. rész — Dalok (publikált + bemutató előtt álló)
// ---------------------------------------------------------------------------

export const songs = pgTable(
  "songs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    /** Sorszám — a csatorna szerinti folyamatos számozás. */
    trackNumber: integer("track_number"),
    author: text("author").notNull(),
    title: text("title").notNull(),
    style: text("style"),
    /** YouTube videó azonosító (11 karakter). Ebből készül a link és az alap-borító. */
    ytId: text("yt_id"),
    /** Megjelenés vagy premier dátuma. */
    releaseDate: date("release_date"),
    /** Megjelent már? (ha hamis: bemutató előtt áll) */
    published: boolean("published").notNull().default(false),
    /**
     * Borító. Ha üres, a YT ID-ből generált thumbnailt használjuk.
     * Ha ki van töltve (pl. Vercel Blob URL), az írja felül a YT borítót.
     */
    coverImageUrl: text("cover_image_url"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("songs_track_number_idx").on(t.trackNumber)],
);

// ---------------------------------------------------------------------------
// 1/b — Lejátszási listák (M:N a dalokkal)
// ---------------------------------------------------------------------------

export const playlists = pgTable("playlists", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Emoji jelölő (pl. ⚔️, 🇭🇺). */
  emoji: text("emoji"),
  name: text("name").notNull(),
  /** Megjelenítési sorrend a felületen. */
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Kapcsolótábla: melyik dal melyik lejátszási listá(k)ban szerepel. */
export const songPlaylists = pgTable(
  "song_playlists",
  {
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    playlistId: uuid("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.songId, t.playlistId] })],
);

// ---------------------------------------------------------------------------
// 1/c — Suno munkacím-napló (kreatív napló, dalonként több bejegyzés)
// ---------------------------------------------------------------------------

export const songWorkingTitles = pgTable(
  "song_working_titles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    songId: uuid("song_id")
      .notNull()
      .references(() => songs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: workingTitleStatus("status").notNull().default("draft"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("song_working_titles_song_idx").on(t.songId)],
);

// ---------------------------------------------------------------------------
// 2. rész — Kívánságlista
// ---------------------------------------------------------------------------

export const wishlist = pgTable("wishlist", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Ki kérte. */
  requestedBy: text("requested_by").notNull(),
  /** Mikor kérte. */
  requestedAt: date("requested_at"),
  author: text("author"),
  title: text("title").notNull(),
  /** Elkészíthető? igen / nem / talán */
  feasible: feasibility("feasible").notNull().default("maybe"),
  /** Publikálás dátuma (ha már elkészült és kiment). */
  publishedDate: date("published_date"),
  /** YouTube videó azonosító a kész dalhoz (kattintható link forrása). */
  ytId: text("yt_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// 3. rész — Ötletek a további dalokhoz
// ---------------------------------------------------------------------------

export const ideas = pgTable("ideas", {
  id: uuid("id").primaryKey().defaultRandom(),
  /** Előadó. */
  performer: text("performer"),
  title: text("title").notNull(),
  /** Elkészíthető? igen / nem / talán */
  feasible: feasibility("feasible").notNull().default("maybe"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ---------------------------------------------------------------------------
// Relációk (a db.query API-hoz)
// ---------------------------------------------------------------------------

export const songsRelations = relations(songs, ({ many }) => ({
  songPlaylists: many(songPlaylists),
  workingTitles: many(songWorkingTitles),
}));

export const playlistsRelations = relations(playlists, ({ many }) => ({
  songPlaylists: many(songPlaylists),
}));

export const songPlaylistsRelations = relations(songPlaylists, ({ one }) => ({
  song: one(songs, {
    fields: [songPlaylists.songId],
    references: [songs.id],
  }),
  playlist: one(playlists, {
    fields: [songPlaylists.playlistId],
    references: [playlists.id],
  }),
}));

export const songWorkingTitlesRelations = relations(
  songWorkingTitles,
  ({ one }) => ({
    song: one(songs, {
      fields: [songWorkingTitles.songId],
      references: [songs.id],
    }),
  }),
);

// ---------------------------------------------------------------------------
// Típusok
// ---------------------------------------------------------------------------

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type InviteCode = typeof inviteCodes.$inferSelect;
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
export type Playlist = typeof playlists.$inferSelect;
export type NewPlaylist = typeof playlists.$inferInsert;
export type SongPlaylist = typeof songPlaylists.$inferSelect;
export type SongWorkingTitle = typeof songWorkingTitles.$inferSelect;
export type NewSongWorkingTitle = typeof songWorkingTitles.$inferInsert;
export type WishlistItem = typeof wishlist.$inferSelect;
export type NewWishlistItem = typeof wishlist.$inferInsert;
export type Idea = typeof ideas.$inferSelect;
export type NewIdea = typeof ideas.$inferInsert;
