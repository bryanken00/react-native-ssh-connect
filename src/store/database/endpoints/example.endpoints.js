import db from "../db";
import { generateUUID } from "../helpers/uuid";

/**
 * Example endpoints — delete this file once you have real tables.
 *
 * An "endpoint" here is a plain function that owns one SQL statement against
 * the local database. Conventions:
 *
 * 1. `db_` prefix on every export, so a call site reads unambiguously as a
 *    local-database hit rather than a network request.
 * 2. One file per table, mirroring `tables/<name>.table.js`.
 * 3. Always parameterise (`?`) — never interpolate values into SQL.
 * 4. Return plain data. No Toasts, no store writes, no navigation. Side
 *    effects belong in the hook or screen that calls this.
 * 5. `expo-sqlite`'s sync API is used throughout. It is fast enough for
 *    normal reads and avoids async plumbing in render paths.
 *
 * See `db.js` for the available helpers: query, queryFirst, run, transaction
 * and prepare.
 */

// ── Reads ────────────────────────────────────────────────────────────────────

export const db_getItems = () => {
  return db.query(
    `SELECT * FROM items WHERE status = 'active' ORDER BY createdAt DESC`,
  );
};

export const db_getItemById = (itemId) => {
  return db.queryFirst(`SELECT * FROM items WHERE itemId = ?`, [itemId]);
};

/** Rows created locally that a server has not acknowledged yet. */
export const db_getUnsyncedItems = () => {
  return db.query(`SELECT * FROM items WHERE isSync = 0`);
};

// ── Writes ───────────────────────────────────────────────────────────────────

/** Returns the generated (or supplied) itemId. */
export const db_insertItem = (item) => {
  const itemId = item.itemId || generateUUID();

  db.run(
    `INSERT INTO items (itemId, name, status, isSync)
     VALUES (?,?,?,?)`,
    [itemId, item.name, item.status || "active", item.isSync ?? 0],
  );

  return itemId;
};

export const db_updateItem = (itemId, name) => {
  const result = db.run(
    `UPDATE items SET name = ?, isSync = 0, updatedAt = datetime('now')
     WHERE itemId = ?`,
    [name, itemId],
  );
  return result.changes;
};

/** Soft delete — keeps the row so a later sync can reconcile it. */
export const db_deleteItem = (itemId) => {
  const result = db.run(
    `UPDATE items SET status = 'inactive', isSync = 0, updatedAt = datetime('now')
     WHERE itemId = ?`,
    [itemId],
  );
  return result.changes;
};

export const db_markItemsSynced = (itemIds) => {
  if (!itemIds.length) return;

  db.transaction(() => {
    const stmt = db.prepare(`UPDATE items SET isSync = 1 WHERE itemId = ?`);
    try {
      for (const itemId of itemIds) stmt.executeSync([itemId]);
    } finally {
      stmt.finalizeSync();
    }
  });
};

/**
 * Bulk replace from a server payload (server → device sync).
 * Wrapped in a transaction with a prepared statement — the only sane way to
 * insert more than a handful of rows.
 */
export const db_replaceAllItems = (serverItems) => {
  db.transaction(() => {
    db.run(`DELETE FROM items`);

    if (!serverItems.length) return;

    const stmt = db.prepare(
      `INSERT INTO items (itemId, name, status, isSync) VALUES (?,?,?,1)`,
    );
    try {
      for (const item of serverItems) {
        stmt.executeSync([
          item.itemId || generateUUID(),
          item.name,
          (item.status || "active").toLowerCase(),
        ]);
      }
    } finally {
      stmt.finalizeSync();
    }
  });
};
