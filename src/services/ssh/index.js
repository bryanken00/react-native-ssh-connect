import { IS_DEMO } from "@/constants";
import * as mockClient from "./mockClient";
import * as nativeClient from "./nativeClient";

/**
 * The one place anything above knows how a shell gets opened.
 *
 * Both transports expose the same two-method session — `write(data)` and
 * `close()` — and both push output through the `onData` callback, so
 * `useSshSession` and every screen are identical either way. Swapping in a
 * WebSocket bridge later means adding a third file here and one line below.
 *
 * ── api/ vs requests/ ───────────────────────────────────────────────────────
 * This folder plays the `services/api/` role: it opens connections and moves
 * bytes, and does nothing else — no toasts, no store writes, no navigation.
 * Those belong to `hooks/useSshSession` and the screens, the way `requests/`
 * owns them for HTTP.
 *
 * Note the demo-mode check lives here rather than in the transports, matching
 * the reason given in CLAUDE.md: a transport describes a real capability, and
 * "pretend the server answered" is not one.
 */

/**
 * Control bytes the on-screen key row sends. Written out so no screen has to
 * hardcode `"\x03"` and hope.
 *
 * Arrows are the three-byte xterm form (`ESC [ A`), which is what a shell
 * started with `TERM=xterm` expects — the application-cursor form (`ESC O A`)
 * would be silently ignored by most.
 */
export const SSH_KEYS = {
  enter: "\r",
  tab: "\t",
  escape: "\x1b",
  backspace: "\x7f",
  ctrlA: "\x01",
  ctrlC: "\x03",
  ctrlD: "\x04",
  ctrlE: "\x05",
  ctrlL: "\x0c",
  ctrlR: "\x12",
  ctrlZ: "\x1a",
  up: "\x1b[A",
  down: "\x1b[B",
  right: "\x1b[C",
  left: "\x1b[D",
};

/**
 * Which transport a connection would use right now, and why.
 *
 * The terminal screen shows this: a simulated session that looks real is worse
 * than no session at all, because you will believe the server said something
 * it never said.
 *
 * @returns {{ kind: 'native'|'mock', reason: string|null }}
 */
export const describeSshTransport = () => {
  if (IS_DEMO) {
    return {
      kind: "mock",
      reason: "Demo mode is on (EXPO_PUBLIC_DEMO_MODE=true).",
    };
  }
  if (!nativeClient.isNativeSshAvailable()) {
    return {
      kind: "mock",
      reason:
        "The native SSH module is not in this build. Run `npx expo prebuild` and `npx expo run:android` (or run:ios) to connect for real.",
    };
  }
  return { kind: "native", reason: null };
};

/**
 * Open an interactive shell on a saved host.
 *
 * @param {object}   config
 * @param {object}   config.host    - a row from the `ssh_hosts` table
 * @param {object}   config.secret  - from `services/ssh/secrets`; ignored by mock
 * @param {Function} config.onData  - chunk of shell output, as it arrives
 * @param {Function} config.onClose - remote hung up; receives a reason string
 * @returns {Promise<{write: (data: string) => Promise<void>, close: () => void}>}
 * @throws  {Error} with a message fit to show the user
 */
export const openSshSession = async ({ host, secret, onData, onClose }) => {
  const transport = describeSshTransport();
  const client = transport.kind === "native" ? nativeClient : mockClient;

  return client.connect({ host, secret, onData, onClose });
};
