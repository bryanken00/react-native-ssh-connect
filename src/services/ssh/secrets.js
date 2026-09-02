import * as SecureStore from "expo-secure-store";

/**
 * The credential half of a saved host.
 *
 * Everything a connection needs *except* the secret lives in the `ssh_hosts`
 * SQLite table. The secret lives here, in the iOS Keychain / Android Keystore,
 * so it is encrypted at rest and excluded from plain device backups. The two
 * halves are joined by `hostId`.
 *
 * Shape stored, as JSON, one entry per host:
 *   { password: "…" }                            authType 'password'
 *   { privateKey: "-----BEGIN…", passphrase? }   authType 'key'
 *
 * ⚠️ **Key size.** `expo-secure-store` warns above 2048 bytes per value and
 * may fail outright on some Android devices. An ed25519 private key is ~400
 * bytes and always fits; a 4096-bit RSA key is ~3.2KB and will not reliably.
 * Prefer ed25519 — `ssh-keygen -t ed25519`.
 *
 * Every function here is best-effort and returns rather than throws: a missing
 * or unreadable credential is a normal state the connect screen must handle
 * (the Keychain entry survives an app reinstall on iOS but not on Android),
 * not an exception to propagate through render.
 */

/**
 * SecureStore keys accept only alphanumerics, `.`, `-` and `_`. `hostId` is a
 * UUID, so it already conforms — the prefix just namespaces us against
 * whatever else the app stores.
 */
const secretKey = (hostId) => `ssh.secret.${hostId}`;

/** @returns {Promise<boolean>} false if the platform refused to store it. */
export const saveSshSecret = async (hostId, secret) => {
  try {
    await SecureStore.setItemAsync(secretKey(hostId), JSON.stringify(secret), {
      // Readable only while the device is unlocked, and never restored onto a
      // different device from a backup.
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return true;
  } catch (error) {
    console.error("[ssh/secrets] save failed:", error?.message);
    return false;
  }
};

/** @returns {Promise<object|null>} null when nothing is stored for this host. */
export const getSshSecret = async (hostId) => {
  try {
    const raw = await SecureStore.getItemAsync(secretKey(hostId));
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("[ssh/secrets] read failed:", error?.message);
    return null;
  }
};

/** Call this whenever the owning `ssh_hosts` row is deleted. */
export const deleteSshSecret = async (hostId) => {
  try {
    await SecureStore.deleteItemAsync(secretKey(hostId));
    return true;
  } catch (error) {
    console.error("[ssh/secrets] delete failed:", error?.message);
    return false;
  }
};
