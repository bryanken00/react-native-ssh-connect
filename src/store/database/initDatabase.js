import { initExampleTable } from "./tables/example.table";
import { runMigrations } from "./migrations";
import db from "./db";

/**
 * Indexes SQLite does not create for you.
 *
 * PRIMARY KEY and UNIQUE columns are indexed automatically — everything else
 * is a full table scan. Add an index for any column you filter or sort by on
 * a hot path. All use IF NOT EXISTS so this is safe on every startup.
 */
const initIndexes = () => {
  // Example — `items` is filtered by status on every list load.
  db.execSync(
    `CREATE INDEX IF NOT EXISTS idx_items_status
     ON items(status)`,
  );
  // Example — unsynced-rows query.
  db.execSync(
    `CREATE INDEX IF NOT EXISTS idx_items_isSync
     ON items(isSync)`,
  );
};

/**
 * Called once from App.js on mount.
 *
 * Order matters: create tables first, then run migrations against them, then
 * add indexes. Register each new table file in the block below.
 */
export const initDatabase = () => {
  try {
    // ── Tables ───────────────────────────────────────────────────────────────
    initExampleTable();

    console.log("[DB] Base tables initialized");

    // ── Migrations ───────────────────────────────────────────────────────────
    // Schema changes to tables already live on a device. See migrations/README.md.
    runMigrations();

    // ── Indexes ──────────────────────────────────────────────────────────────
    initIndexes();

    console.log("[DB] Database initialization complete");
  } catch (error) {
    console.error("[DB] Initialization error:", error);
  }
};
