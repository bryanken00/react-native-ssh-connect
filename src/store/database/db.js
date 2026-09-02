import * as SQLite from "expo-sqlite";

class Database {
  constructor() {
    this.db = SQLite.openDatabaseSync("app.db");
    this._testConnection();
  }

  _testConnection() {
    try {
      this.db.execSync("SELECT 1");
      console.log("✓ Database connected");
    } catch (error) {
      console.error("✗ Database connection failed:", error.message);
      throw error;
    }
  }

  // ── DDL ───────────────────────────────────────────────────────────────────

  /** Execute a raw SQL statement (CREATE TABLE, PRAGMA, etc.) */
  execSync(sql) {
    return this.db.execSync(sql);
  }

  // ── Queries ───────────────────────────────────────────────────────────────

  /** Return all matching rows */
  query(sql, args = []) {
    return this.db.getAllSync(sql, args);
  }

  /** Return the first matching row, or null */
  queryFirst(sql, args = []) {
    return this.db.getFirstSync(sql, args) ?? null;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /** Run INSERT / UPDATE / DELETE. Returns { lastInsertRowId, changes } */
  run(sql, args = []) {
    return this.db.runSync(sql, args);
  }

  // ── Transactions ──────────────────────────────────────────────────────────

  /**
   * Synchronous transaction — wraps multiple writes atomically.
   * Auto-commits on success, auto-rolls back on throw.
   *
   * Usage:
   *   db.transaction(() => {
   *     db.run("INSERT INTO ...", [...]);
   *     db.run("UPDATE ...", [...]);
   *   });
   */
  transaction(callback) {
    return this.db.withTransactionSync(callback);
  }

  /**
   * Prepared statement — use for bulk inserts inside a transaction.
   * Always call stmt.finalizeSync() in a finally block.
   *
   * Usage:
   *   const stmt = db.prepare("INSERT INTO t (a, b) VALUES (?, ?)");
   *   try {
   *     db.transaction(() => rows.forEach(r => stmt.executeSync([r.a, r.b])));
   *   } finally {
   *     stmt.finalizeSync();
   *   }
   */
  prepare(sql) {
    return this.db.prepareSync(sql);
  }
}

const db = new Database();
export default db;
