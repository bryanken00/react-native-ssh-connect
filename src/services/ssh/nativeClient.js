import { NativeModules } from "react-native";

/**
 * The real client: `@dylankenneally/react-native-ssh-sftp`, which wraps JSch
 * on Android and NMSSH on iOS.
 *
 * ⚠️ **Why every reference here is lazy.** That package's entry module runs
 * `new NativeEventEmitter(NativeModules.RNSSHClient)` at import time, and
 * NativeEventEmitter throws on iOS when handed `undefined`. A top-level
 * `import` would therefore crash the whole app anywhere the native module is
 * absent — Expo Go, web, and any JS-only bundle check. So the module is
 * `require`d inside `connect`, behind the `NativeModules` probe below, and the
 * app falls back to `mockClient` when it is missing.
 *
 * Being a native module, this needs a development build:
 *
 *   npx expo prebuild --clean --platform android
 *   npx expo run:android
 *
 * It will never work in Expo Go or on web, by construction.
 */

/**
 * True once the native module is linked into the running binary. Cheap, and
 * safe to call anywhere — it only reads the NativeModules registry.
 */
export const isNativeSshAvailable = () => Boolean(NativeModules.RNSSHClient);

let cached = null;

const loadModule = () => {
  if (cached) return cached;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@dylankenneally/react-native-ssh-sftp");
  cached = { SSHClient: mod.default ?? mod, PtyType: mod.PtyType };
  return cached;
};

/** Native errors arrive as strings, Errors, or `{ message }` — flatten them. */
const describe = (error) => {
  if (!error) return "Connection failed";
  if (typeof error === "string") return error;
  return error.message || error.description || String(error);
};

/**
 * Open an interactive shell.
 *
 * @param {object}   config
 * @param {object}   config.host    - a row from `ssh_hosts`
 * @param {object}   config.secret  - `{ password }` or `{ privateKey, passphrase }`
 * @param {Function} config.onData  - called with each chunk of shell output
 * @returns {Promise<{write: Function, close: Function}>}
 */
export const connect = async ({ host, secret, onData }) => {
  const { SSHClient, PtyType } = loadModule();

  let client;
  try {
    client =
      host.authType === "key"
        ? await SSHClient.connectWithKey(
            host.host,
            Number(host.port) || 22,
            host.username,
            secret.privateKey,
            secret.passphrase || undefined,
          )
        : await SSHClient.connectWithPassword(
            host.host,
            Number(host.port) || 22,
            host.username,
            secret.password,
          );
  } catch (error) {
    throw new Error(describe(error));
  }

  // Register the output listener before the shell starts, or the login banner
  // and first prompt are emitted into a void.
  client.on("Shell", (chunk) => {
    if (chunk) onData(String(chunk));
  });

  try {
    // xterm is what the far side reads from $TERM. Requesting it gets colour
    // and completion; `vanilla` would get neither.
    await client.startShell(PtyType.XTERM);
  } catch (error) {
    client.disconnect();
    throw new Error(describe(error));
  }

  let closed = false;

  return {
    write: (data) => client.writeToShell(data),
    close: () => {
      if (closed) return;
      closed = true;
      // `off` before `disconnect`: the native side can emit one last chunk
      // during teardown, and by then the React state it would land in is gone.
      try {
        client.off("Shell");
      } catch {
        /* older builds have no `off` — the disconnect below still tears down */
      }
      client.disconnect();
    },
  };
};
