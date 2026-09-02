import db from "../db";

/**
 * Saved SSH connections.
 *
 * ⚠️ **No secret ever goes in this table.** SQLite here is a plain file in the
 * app sandbox — readable by anyone with the device unlocked and a backup tool,
 * and included in unencrypted iCloud/Android backups. Passwords, private keys
 * and passphrases live in the Keychain / Android Keystore via
 * `services/ssh/secrets.js`, keyed by `hostId`. This table holds only what is
 * safe to see: where to connect and as whom.
 *
 * `authType` records *which* credential to look up, never the credential:
 *   'password' → secrets store holds { password }
 *   'key'      → secrets store holds { privateKey, passphrase? }
 *
 * Conventions follow `example.table.js` — `IF NOT EXISTS` so this is safe on
 * every start, a UUID `hostId` alongside the rowid, ISO-8601 timestamps as
 * TEXT.
 *
 * Two deliberate divergences from the example table:
 *
 * 1. **No `isSync` column.** Connection profiles are device-local by design.
 *    Syncing "which machines this person administers" to a server is a
 *    decision an app should make on purpose, not inherit from a template.
 * 2. **Hard delete, not soft.** A soft-deleted row would leave its Keychain
 *    entry orphaned, so `db_deleteSshHost` removes the row and the caller
 *    removes the secret — see `useSshHosts.remove`.
 */
export const createSshTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ssh_hosts (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      hostId          TEXT    UNIQUE NOT NULL,
      label           TEXT    NOT NULL,
      host            TEXT    NOT NULL,
      port            INTEGER NOT NULL DEFAULT 22,
      username        TEXT    NOT NULL,
      authType        TEXT    NOT NULL DEFAULT 'password',
      lastConnectedAt TEXT,
      createdAt       TEXT    DEFAULT (datetime('now')),
      updatedAt       TEXT
    )
  `);
};

export const initSshTable = () => {
  createSshTable();
};
