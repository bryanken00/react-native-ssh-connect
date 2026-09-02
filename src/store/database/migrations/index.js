/**
 * Database Migration Runner
 * Handles running migrations in order and tracking which have been applied.
 *
 * Add new migrations to the `migrations` array below.
 * Each migration runs exactly once and is tracked in the `migrations` table.
 */

import db from "../db";
// import { migration_001_example } from "./001_example.js";

const createMigrationsTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS migrations (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL UNIQUE,
      appliedAt  TEXT DEFAULT (datetime('now'))
    )
  `);
};

const isMigrationApplied = (name) => {
  const result = db.queryFirst(
    `SELECT COUNT(*) as count FROM migrations WHERE name = ?`,
    [name],
  );
  return result.count > 0;
};

const markMigrationApplied = (name) => {
  db.run(`INSERT INTO migrations (name) VALUES (?)`, [name]);
};

/**
 * List of all migrations, in the order they should run.
 *
 * Empty on a fresh template — your initial schema belongs in
 * `tables/*.table.js`, not in a migration. Add an entry here only when you
 * need to change a schema that is already live on someone's device.
 *
 * See README.md in this folder for the full convention. Example entry:
 *
 *   {
 *     name: "001_example",
 *     description: "Add a `note` column to items",
 *     run: () => migration_001_example(),
 *   },
 */
const migrations = [];

export const runMigrations = () => {
  try {
    createMigrationsTable();

    let migrationsRun = 0;

    for (const migration of migrations) {
      if (!isMigrationApplied(migration.name)) {
        migration.run();
        markMigrationApplied(migration.name);
        migrationsRun++;
      }
    }

    return true;
  } catch (error) {
    console.error("[Migrations] Error running migrations:", error);
    throw error;
  }
};

export const getAppliedMigrations = () => {
  try {
    createMigrationsTable();
    return db.query(`SELECT * FROM migrations ORDER BY appliedAt ASC`);
  } catch (error) {
    console.error("[Migrations] Error getting applied migrations:", error);
    return [];
  }
};

export const getPendingMigrations = () => {
  try {
    createMigrationsTable();
    return migrations.filter((m) => !isMigrationApplied(m.name));
  } catch (error) {
    console.error("[Migrations] Error getting pending migrations:", error);
    return [];
  }
};
