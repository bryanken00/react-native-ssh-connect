import { useCallback, useMemo, useState } from "react";
import { deleteSshSecret, saveSshSecret } from "@/services/ssh/secrets";
import {
  db_deleteSshHost,
  db_getSshHosts,
  db_insertSshHost,
  db_updateSshHost,
} from "@/store/database/endpoints/ssh.endpoints";

/**
 * Module state for the host list: the rows, the search box, and the form sheet.
 *
 * Kept out of the screen so the screen file stays layout-only — same split as
 * `useExampleModule`, which this follows.
 *
 * ── Why not `useQuery` ──────────────────────────────────────────────────────
 * The engineering checklist says never fetch in an effect, use React Query.
 * That rule is about the *network* — caching, dedup, cancellation, refetch on
 * reconnect. There is no network here: `expo-sqlite`'s sync API reads these
 * rows in well under a millisecond, so a query client would add a cache to
 * invalidate and an async boundary to await for no benefit. Writing a secret
 * *is* async, so `save` and `remove` are, and `saving` drives the pending
 * state the UI owes.
 *
 * Rows are re-read from SQLite after every write rather than patched in
 * memory: it is one cheap statement and it keeps the `lastConnectedAt`
 * ordering honest after a session.
 */

/** Nothing here is a secret — those are collected separately and never re-read. */
const BLANK = {
  label: "",
  host: "",
  port: "22",
  username: "",
  authType: "password",
  password: "",
  privateKey: "",
  passphrase: "",
};

/**
 * Assemble what goes in the Keychain, or null when the user left the
 * credential fields untouched on an edit (meaning "keep what is stored").
 */
const buildSecret = (draft) => {
  if (draft.authType === "key") {
    const privateKey = draft.privateKey.trim();
    return privateKey
      ? { privateKey, passphrase: draft.passphrase || undefined }
      : null;
  }
  return draft.password ? { password: draft.password } : null;
};

export const useSshHosts = () => {
  const [records, setRecords] = useState(() => db_getSshHosts());
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  // null = closed, {} = create, {…row} = edit
  const [editing, setEditing] = useState(null);

  const refresh = useCallback(() => setRecords(db_getSshHosts()), []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.label.toLowerCase().includes(q) ||
        r.host.toLowerCase().includes(q) ||
        r.username.toLowerCase().includes(q),
    );
  }, [records, search]);

  const save = useCallback(
    async (draft) => {
      setSaving(true);
      try {
        const row = {
          label: draft.label.trim(),
          host: draft.host.trim(),
          port: Number(draft.port) || 22,
          username: draft.username.trim(),
          authType: draft.authType,
        };

        const hostId = draft.hostId
          ? (db_updateSshHost(draft.hostId, row), draft.hostId)
          : db_insertSshHost(row);

        const secret = buildSecret(draft);
        if (secret) {
          const stored = await saveSshSecret(hostId, secret);
          if (!stored) {
            // The row exists but has no usable credential. Say so rather than
            // letting the failure surface later as a login error.
            throw new Error(
              "Saved the host, but the device refused to store the credential. Private keys over ~2KB can fail — an ed25519 key always fits.",
            );
          }
        }

        refresh();
        setEditing(null);
      } finally {
        setSaving(false);
      }
    },
    [refresh],
  );

  const remove = useCallback(
    async (hostId) => {
      db_deleteSshHost(hostId);
      // Order matters: the row goes first so a failure here cannot leave a
      // host you can see but not delete. A stranded Keychain entry is inert.
      await deleteSshSecret(hostId);
      refresh();
    },
    [refresh],
  );

  return {
    // data
    hosts: filtered,
    total: records.length,
    refresh,
    // search
    search,
    setSearch,
    // form sheet
    editing,
    saving,
    openCreate: () => setEditing({}),
    openEdit: (record) => setEditing(record),
    closeSheet: () => setEditing(null),
    save,
    remove,
  };
};

export { BLANK as BLANK_HOST };
export default useSshHosts;
