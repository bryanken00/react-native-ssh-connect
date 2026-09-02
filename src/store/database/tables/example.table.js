import db from "../db";

/**
 * Example table — delete this file once you have real tables.
 *
 * Conventions worth copying:
 *
 * 1. `IF NOT EXISTS` on every CREATE. Table files run on *every* app start,
 *    so they must be idempotent.
 * 2. Two IDs. `id` is the local autoincrement rowid; `itemId` is a UUID that
 *    is stable across devices and safe to send to a server. Always join and
 *    reference by the UUID, never by the rowid.
 * 3. `isSync` flag. 0 = created locally and not yet pushed, 1 = in sync with
 *    the server. This is what makes offline-first queries cheap:
 *    `SELECT * FROM items WHERE isSync = 0`.
 * 4. Soft delete via `status`. Rows go to 'inactive' instead of being
 *    removed, so a later sync can still reconcile them.
 * 5. Timestamps as TEXT via `datetime('now')` — SQLite has no date type, and
 *    ISO-8601 strings sort correctly as text.
 *
 * One file per table. Export a `create…Table` and an `init…Table`; the init
 * wrapper is where seed data or dependent indexes go if you need them.
 */
export const createExampleTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      itemId     TEXT    UNIQUE NOT NULL,
      name       TEXT    NOT NULL,
      status     TEXT    DEFAULT 'active',
      isSync     INTEGER DEFAULT 0,
      createdAt  TEXT    DEFAULT (datetime('now')),
      updatedAt  TEXT
    )
  `);
};

export const initExampleTable = () => {
  createExampleTable();
};
