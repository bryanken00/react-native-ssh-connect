import { useCallback, useEffect, useRef, useState } from "react";
import { createTerminalBuffer } from "@/lib/terminal";
import { describeSshTransport, openSshSession, SSH_KEYS } from "@/services/ssh";
import { getSshSecret } from "@/services/ssh/secrets";
import { db_touchSshHost } from "@/store/database/endpoints/ssh.endpoints";

/**
 * Owns one shell session: connecting, the scrollback, sending keys, and
 * tearing down cleanly.
 *
 * ── Why the output is batched ───────────────────────────────────────────────
 * A shell can emit thousands of small chunks a second — `cat` a large file and
 * every one of them would be a `setState`, i.e. a render and a FlatList diff.
 * Chunks land in the terminal buffer synchronously (cheap, no React involved)
 * and a single flush publishes a snapshot every FLUSH_MS. Output stays smooth
 * and the JS thread stays free, which §3 and §5 of the engineering checklist
 * both care about.
 *
 * ── Why there is a generation counter ───────────────────────────────────────
 * Connecting is async, and the user can hit Reconnect — or leave the screen —
 * while a connect is still in flight. Every callback checks it is still the
 * current generation before touching state, so a late-resolving connection
 * closes itself instead of writing into an unmounted component or stomping a
 * newer session.
 *
 * @param {object} host - a row from `ssh_hosts`
 * @returns {{
 *   status: 'connecting'|'connected'|'error'|'closed',
 *   error: string|null,
 *   lines: object[],
 *   transport: {kind: string, reason: string|null},
 *   send: (text: string) => void,
 *   sendLine: (text: string) => void,
 *   sendKey: (key: string) => void,
 *   reconnect: () => void,
 *   disconnect: () => void,
 *   clear: () => void,
 * }}
 */

/** ~24fps of terminal repaint. Fast enough to feel live, slow enough to batch. */
const FLUSH_MS = 40;

export const useSshSession = (host) => {
  const bufferRef = useRef(null);
  if (bufferRef.current === null) bufferRef.current = createTerminalBuffer();

  const sessionRef = useRef(null);
  const flushRef = useRef(null);
  /** Bumped on every connect attempt and on unmount; see the note above. */
  const genRef = useRef(0);

  const [lines, setLines] = useState(() => bufferRef.current.snapshot());
  const [status, setStatus] = useState("connecting");
  const [error, setError] = useState(null);
  const [transport] = useState(describeSshTransport);

  const flushNow = useCallback(() => {
    if (flushRef.current) {
      clearTimeout(flushRef.current);
      flushRef.current = null;
    }
    setLines(bufferRef.current.snapshot());
  }, []);

  const scheduleFlush = useCallback(() => {
    if (flushRef.current) return;
    flushRef.current = setTimeout(() => {
      flushRef.current = null;
      setLines(bufferRef.current.snapshot());
    }, FLUSH_MS);
  }, []);

  const teardown = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
  }, []);

  const connect = useCallback(async () => {
    const gen = ++genRef.current;
    const isCurrent = () => gen === genRef.current;

    teardown();
    setStatus("connecting");
    setError(null);

    const buffer = bufferRef.current;
    buffer.writeSystem(
      `Connecting to ${host.username}@${host.host}:${host.port}…`,
    );
    flushNow();

    // The credential never enters React state or a navigation param — it is
    // read out of the Keychain here and handed straight to the transport.
    const secret = await getSshSecret(host.hostId);
    if (!isCurrent()) return;

    // Also catches the mismatch case: the auth type was switched to a key but
    // the keychain still holds a password, so the stored secret is the wrong
    // kind. Better a sentence here than an opaque native auth failure.
    const usable =
      secret &&
      (host.authType === "key" ? !!secret.privateKey : !!secret.password);

    if (transport.kind === "native" && !usable) {
      const message =
        "No saved credential for this host. Edit it and enter the password or key again.";
      buffer.writeSystem(message, "error");
      flushNow();
      setStatus("error");
      setError(message);
      return;
    }

    try {
      const session = await openSshSession({
        host,
        secret,
        onData: (chunk) => {
          if (!isCurrent()) return;
          buffer.write(chunk);
          scheduleFlush();
        },
        onClose: (reason) => {
          if (!isCurrent()) return;
          buffer.writeSystem(reason || "Connection closed.", "error");
          flushNow();
          setStatus("closed");
        },
      });

      // Resolved after the user navigated away or hit Reconnect — the session
      // is real and must be closed, but nothing else may be touched.
      if (!isCurrent()) {
        session.close();
        return;
      }

      sessionRef.current = session;
      setStatus("connected");
      db_touchSshHost(host.hostId);
    } catch (err) {
      if (!isCurrent()) return;
      const message = err?.message || "Connection failed.";
      buffer.writeSystem(message, "error");
      flushNow();
      setStatus("error");
      setError(message);
    }
  }, [host, transport.kind, teardown, flushNow, scheduleFlush]);

  // One connect per host, and an unconditional teardown on the way out — a
  // socket left open behind a popped screen is the classic leak here.
  useEffect(() => {
    connect();
    return () => {
      genRef.current++;
      if (flushRef.current) clearTimeout(flushRef.current);
      sessionRef.current?.close();
      sessionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host.hostId]);

  const send = useCallback(
    (text) => {
      const session = sessionRef.current;
      if (!session || !text) return;

      // No local echo: a PTY echoes what you type, so printing it here too
      // would double every character.
      Promise.resolve(session.write(text)).catch((err) => {
        bufferRef.current.writeSystem(
          err?.message || "Write failed — the connection is gone.",
          "error",
        );
        flushNow();
        setStatus("closed");
      });
    },
    [flushNow],
  );

  const sendLine = useCallback(
    (text) => send(`${text}${SSH_KEYS.enter}`),
    [send],
  );

  return {
    status,
    error,
    lines,
    transport,
    send,
    sendLine,
    sendKey: send,
    reconnect: connect,
    disconnect: useCallback(() => {
      genRef.current++;
      teardown();
      bufferRef.current.writeSystem("Disconnected.", "error");
      flushNow();
      setStatus("closed");
    }, [teardown, flushNow]),
    clear: useCallback(() => {
      bufferRef.current.clear();
      flushNow();
    }, [flushNow]),
  };
};

export default useSshSession;
