# SSH

The app opens on a list of saved connections; the ⊕ button adds one; tapping
one opens a shell.

```
Connections tab  ──tap ⊕──▶  New SSH Connection sheet  ──save──▶  back to list
       │
       └──tap a row──▶  Terminal  ──back──▶  list (session closed)
```

---

## Where things live

| Concern | File |
| --- | --- |
| Host list, stats, search | [Screens/Ssh/index.js](../src/Screens/Ssh/index.js) |
| List state, save, delete | [Screens/Ssh/useSshHosts.js](../src/Screens/Ssh/useSshHosts.js) |
| Add / edit form | [Screens/Ssh/HostFormSheet.js](../src/Screens/Ssh/HostFormSheet.js) |
| One row | [Screens/Ssh/SshHostRow.js](../src/Screens/Ssh/SshHostRow.js) |
| Terminal screen | [Screens/Ssh/Terminal/index.js](../src/Screens/Ssh/Terminal/index.js) |
| Session lifecycle | [hooks/useSshSession.js](../src/hooks/useSshSession.js) |
| Transport seam | [services/ssh/index.js](../src/services/ssh/index.js) |
| Real client | [services/ssh/nativeClient.js](../src/services/ssh/nativeClient.js) |
| Simulated client | [services/ssh/mockClient.js](../src/services/ssh/mockClient.js) |
| Credential storage | [services/ssh/secrets.js](../src/services/ssh/secrets.js) |
| ANSI parser / scrollback | [lib/terminal.js](../src/lib/terminal.js) |
| Scrollback rendering | [components/terminal/](../src/components/terminal/) |
| Table + queries | [store/database/tables/ssh.table.js](../src/store/database/tables/ssh.table.js) · [endpoints/ssh.endpoints.js](../src/store/database/endpoints/ssh.endpoints.js) |

The `services/ssh/` split follows the repo's `api/` vs `requests/` rule:
`services/ssh/` moves bytes and nothing else — no toasts, no store writes, no
navigation. Those belong to `useSshSession` and the screens.

---

## ⚠️ You need a development build

`npm start` runs Expo Go, which does **not** contain the native SSH module. In
Expo Go and on web every session is **simulated** — a local fake shell that
never touches the network. The connections screen says so in a banner, and the
terminal's first line says so again. That is deliberate: a fake session that
looked real would let you believe a server said something it never said.

To connect for real:

```bash
npx expo prebuild --clean --platform android
npx expo run:android          # or: prebuild --platform ios && run:ios
```

| Where you run it | What you get |
| --- | --- |
| `npm start` (Expo Go) | simulated |
| `EXPO_PUBLIC_DEMO_MODE=true` | simulated, always |
| `npm run android` / `npm run ios` after a prebuild | real SSH |
| `npm run web` | **does not run** — see below |

`describeSshTransport()` decides which, and it is the only place that knows.

### Web does not build

`npm run web` fails, and has since before this feature existed — the untouched
template fails the same way. It is `expo-sqlite`, not SSH: `App.js` imports
`initDatabase`, which imports `db.js`, which calls `openDatabaseSync` at module
scope. On web that is wa-sqlite, and it needs two things the template never
configured.

```
Unable to resolve "./wa-sqlite/wa-sqlite.wasm"
[ReferenceError: SharedArrayBuffer is not defined]
```

If you ever want web, both are fixed in `metro.config.js`: push `"wasm"` onto
`config.resolver.assetExts`, and have `config.server.enhanceMiddleware` set
`Cross-Origin-Opener-Policy: same-origin` and
`Cross-Origin-Embedder-Policy: require-corp` (wa-sqlite talks to its worker
through a `SharedArrayBuffer`, which browsers only expose to cross-origin
isolated pages). A deployed web build needs those two headers from whatever
serves it, not just from the dev server.

Worth knowing before you spend time on it: **web cannot do real SSH either
way.** A browser has no raw TCP, so the native module can never load there and
every session would be simulated. Web is only useful here for laying out
screens.

### expo-doctor reports 20/21

```
Untested on New Architecture: @dylankenneally/react-native-ssh-sftp
```

Real, and left unsilenced on purpose. The package is actively maintained
(JSch on Android, NMSSH on iOS) but is written against the legacy bridge, so it
reaches the New Architecture through the interop layer rather than natively.
Android builds and runs; **iOS is the weaker side** — the podspec still depends
on the old `React` pod name and on NMSSH, which may need attention during
`pod install`.

Verify on a device before you trust it. Once you have, silence the check with
`expo.doctor.reactNativeDirectoryCheck.exclude` in `package.json` — not before.

---

## Where credentials go

Two stores, joined by `hostId`:

- **SQLite `ssh_hosts`** — label, host, port, username, auth *type*,
  last-connected. All of it safe to log.
- **Keychain / Android Keystore** (`expo-secure-store`) — the password, or the
  private key and its passphrase. Written with
  `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, so it is unreadable while the device is
  locked and never restored onto a different device from a backup.

No secret is ever put in the database, in a navigation param, or in React
state. `useSshSession` reads it from the keychain and hands it straight to the
transport.

**Credentials are write-only in the UI.** Opening an existing host shows empty
credential fields: blank means keep what is stored, typed means replace. The
exception is switching auth type, which makes the stored secret the wrong kind
and forces a new one.

**Use ed25519 keys.** `expo-secure-store` warns above 2048 bytes per value and
can fail outright on some Android devices. An ed25519 key is ~400 bytes; a
4096-bit RSA key is ~3.2KB and will not store reliably.

```bash
ssh-keygen -t ed25519 -C "phone"
```

Paste the whole private key file, `-----BEGIN`/`-----END` lines included.

---

## The terminal

### What it renders

`lib/terminal.js` is a line buffer, not a screen emulator. It handles SGR
colour (16-colour, 256-colour and truecolor), bold/dim/italic/underline/inverse,
`\r` overwrite, backspace, tabs, `ESC[K`, `ESC[2J`, and horizontal cursor
movement. It safely swallows window-title sequences, private modes and every
CSI it does not know.

It has **no cursor row**, so vertical positioning is dropped:

| Works | Does not |
| --- | --- |
| shells, `ls`, `git`, `npm`, `docker`, compilers, `tail -f` | `vim`, `htop`, `top`, `less`, anything full-screen |

Full-screen programs still *run* on the server; their output stacks instead of
repainting in place. Add a grid emulator if you need them — it is a much larger
piece of code, and most sessions never do.

### Typing

A phone keyboard cannot honestly send per-keystroke input — autocorrect
rewrites words after the fact and there is no key-down event for most of it. So
the input bar composes a whole line and sends it on Send, and the row above
carries what a shell needs but a phone keyboard lacks: `esc`, `tab`, `^C`,
`^D`, `^L`, `^Z`, arrows, and the punctuation both mobile keyboards bury.

Arrows are sent as bytes, so command history is the shell's own.

Nothing is echoed locally — the PTY echoes what it receives, so printing it
here too would double every character.

### Performance

Output lands in the buffer synchronously and a snapshot is published every
40ms. Without that, `cat`ting a large file would be one `setState` per chunk.
Lines that did not change keep their object identity, so `TerminalLine`'s
`React.memo` skips them.

Lines **wrap** rather than scrolling sideways — reading one line of `git log`
by dragging left and right is not a real option on a phone. The cost is
variable row heights, which rules out `getItemLayout`.

Scrollback is capped at 2000 lines. The view follows output until you scroll
up; a **Latest** pill reattaches it.

### Colour

`TerminalLine` is the only component in the app that sets colour from a value
rather than a class, because the colour was chosen by the remote host at
runtime. The 16 ANSI colours live in `TERMINAL_PALETTE` in
[lib/theme.js](../src/lib/theme.js) with a set per scheme, and are stored in
the buffer as *names* — so toggling dark mode recolours scrollback that
arrived an hour ago. Only 256-colour and truecolor become literal `#rrggbb`.

There is no bold weight of JetBrains Mono loaded and React Native has no
synthetic weights, so bold renders the way terminals originally did it: by
switching to the bright half of the palette.

---

## Extending

**A different transport** (a WebSocket bridge, a Mosh-style relay): add a file
beside `mockClient.js` exposing `connect({ host, secret, onData, onClose })`
that resolves to `{ write, close }`, then one line in
`services/ssh/index.js`. Nothing above that file changes.

**SFTP / file browsing:** the underlying package already ships it —
`sftpLs`, `sftpUpload`, `sftpDownload`. Expose it through a new function in
`services/ssh/`, not from a screen.

**Port forwarding, jump hosts, agent forwarding:** not supported by the
underlying package. They need a different client.

**Syncing hosts to a server:** deliberately not wired. `ssh_hosts` has no
`isSync` column because pushing "which machines this person administers" to a
backend should be a decision, not an inherited default. If you do it, add
`isSync` in a migration (not in the table file — see
[migrations/README.md](../src/store/database/migrations/README.md)) and never
sync the keychain half.
