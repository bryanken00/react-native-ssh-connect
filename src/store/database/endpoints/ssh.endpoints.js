import db from "../db";
import { generateUUID } from "../helpers/uuid";

/**
 * Local reads/writes for saved SSH connections — one SQL statement per
 * function, `db_` prefixed so a call site reads unambiguously as a local hit.
 * See `example.endpoints.js` for the full convention.
 *
 * ⚠️ Nothing here touches a credential. Secrets are stored separately in the
 * Keychain / Android Keystore — see `services/ssh/secrets.js`. A row returned
 * from this file is safe to log; a secret is not.
 */

// ── Reads ────────────────────────────────────────────────────────────────────

/** Most recently used first, then never-connected hosts by creation order. */
export const db_getSshHosts = () => {
  return db.query(
    `SELECT * FROM ssh_hosts
     ORDER BY lastConnectedAt IS NULL, lastConnectedAt DESC, createdAt DESC`,
  );
};

export const db_getSshHostById = (hostId) => {
  return db.queryFirst(`SELECT * FROM ssh_hosts WHERE hostId = ?`, [hostId]);
};

// ── Writes ───────────────────────────────────────────────────────────────────

/** Returns the generated (or supplied) hostId. */
export const db_insertSshHost = (host) => {
  const hostId = host.hostId || generateUUID();

  db.run(
    `INSERT INTO ssh_hosts (hostId, label, host, port, username, authType)
     VALUES (?,?,?,?,?,?)`,
    [
      hostId,
      host.label,
      host.host,
      host.port ?? 22,
      host.username,
      host.authType || "password",
    ],
  );

  return hostId;
};

export const db_updateSshHost = (hostId, host) => {
  const result = db.run(
    `UPDATE ssh_hosts
     SET label = ?, host = ?, port = ?, username = ?, authType = ?,
         updatedAt = datetime('now')
     WHERE hostId = ?`,
    [
      host.label,
      host.host,
      host.port ?? 22,
      host.username,
      host.authType || "password",
      hostId,
    ],
  );
  return result.changes;
};

/**
 * Hard delete — see the note in `tables/ssh.table.js`. The caller must also
 * delete the Keychain entry, or the credential outlives the row it belonged to.
 */
export const db_deleteSshHost = (hostId) => {
  const result = db.run(`DELETE FROM ssh_hosts WHERE hostId = ?`, [hostId]);
  return result.changes;
};

/** Stamp a successful connection — drives the "most recent first" ordering. */
export const db_touchSshHost = (hostId) => {
  const result = db.run(
    `UPDATE ssh_hosts SET lastConnectedAt = datetime('now') WHERE hostId = ?`,
    [hostId],
  );
  return result.changes;
};
