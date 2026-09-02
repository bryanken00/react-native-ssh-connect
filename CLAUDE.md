# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read [docs/ENGINEERING_CHECKLIST.md](docs/ENGINEERING_CHECKLIST.md) before
> writing code.** It is the standing bar for every change here: reuse what
> exists, what a fetch and a render cost, layout down to 320px and up to a
> tablet, and the loading/empty/error states a screen owes. §10 lists the
> repo's measured gaps. Visual rules are in
> [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md); list-module structure
> is in [docs/MODULE_PATTERN.md](docs/MODULE_PATTERN.md). The SSH feature has
> its own page: [docs/SSH.md](docs/SSH.md).

## What this repo is

A **starter template**, not a product. Expo SDK 57 / React Native 0.86, plain
JavaScript (no `.tsx`). UI is [React Native Reusables](https://reactnativereusables.com)
on NativeWind (Tailwind v3). It ships theming, navigation, data fetching and
offline SQLite.

**There is no auth.** The template's login screen, auth store, `services/*/auth.js`
and the `isAuthenticated` navigator gate were removed — this app has no backend
and no account. Connections live in local SQLite, credentials in the device
keychain, and the device lock screen is the only boundary that matters. See the
note in `Navigation/index.js` if you need to put a gate back.

Its one real domain feature is **SSH**: a list of saved connections, an add
sheet, and a terminal. Read [docs/SSH.md](docs/SSH.md) before touching any of
it — especially the part about needing a development build, because in Expo Go
every session is simulated.

Consequences for how you work here:

- The example module still exists **to be deleted by whoever clones this**:
  `Screens/Example/`, `store/database/tables/example.table.js` and
  `store/database/endpoints/example.endpoints.js`. Don't build on them; don't
  treat them as dead code either. (`constants/demo.js` and
  `Screens/Home/Dashboard/` were deleted with the auth removal.)
- A number of files under `src/` are unreachable from `index.js` **by design**
  — most of `utils/*`, `useCamera`, `LoadingScreen`, `DateRangePicker`,
  `version.js`, `services/api/axios.js`, the SQLite examples, and any
  `components/ui/*` not yet used on a screen. They're a kit for the next
  developer. "Unused" is not a defect here.
- Doc comments carry more weight than usual: they're the product. Match the
  existing density rather than trimming them.

## Commands

```bash
npm start              # expo start --clear
npm run android        # expo run:android  (needs a prebuild + native toolchain)
npm run ios
npm run web            # ⚠️ does not build — expo-sqlite needs wasm + COOP/COEP
                       #    setup Metro never got. Pre-dates the SSH feature;
                       #    see docs/SSH.md. Web cannot do real SSH regardless.
```

**There is no test framework, linter or formatter configured.** No jest, no
eslint, no prettier. Do not invent `npm test` — it does not exist. The actual
verification loop is:

```bash
npx expo-doctor@latest                      # 20/21 — one known failure, see docs/SSH.md
npx expo export --platform android --clear  # the real check: does it bundle?
```

`expo export` catches missing modules, broken imports and Metro config
problems without a device. **Read its asset list** — see the icon-font trap
below. TypeScript is installed and `tsconfig.json` includes `**/*.js` with
`strict: false`, so `npx tsc --noEmit` gives loose type checking, but the code
is not written to satisfy it.

Native folders are generated, never committed:

```bash
npx expo prebuild --clean --platform android
```

## Architecture

### `services/api/` vs `services/requests/` — the central convention

`api/` functions take a payload, make the call, return `response.data`. Nothing
else — no toasts, no store writes, no navigation. `requests/` wraps them in
`useQuery`/`useMutation` and owns every side effect. **Screens only ever import
from `requests/`.**

`requests/` is currently empty — it went with the auth removal, and nothing in
the app makes an HTTP call yet. The convention still stands for whenever
something does.

`services/ssh/` plays the `api/` role for shells: it opens connections and
moves bytes, and owns no side effects. `hooks/useSshSession` and the screens
own those, the way `requests/` would for HTTP. Demo mode's transport switch
lives in `services/ssh/index.js` for the same reason the auth bypass used to
live in `requests/`: a transport describes a real capability, and "pretend the
server answered" is not one.

### Local database layering

`store/database/` splits three ways, one file per table in each:

- `tables/*.table.js` — `CREATE TABLE IF NOT EXISTS`, runs on every startup
- `endpoints/*.endpoints.js` — one SQL statement per function, all named `db_*`
- `migrations/` — numbered, run once, tracked in a `migrations` table

**Initial schema belongs in `tables/`, not a migration.** Migrations are only
for changing a schema already installed on someone's device. New tables must be
registered in `initDatabase.js`.

The `db_` prefix exists so a call site reads unambiguously as a local hit
rather than a network request.

### Navigation

`Navigation/index.js` is a **single stack** — the `isAuthenticated` gate was
removed with auth. Route names live in `constants/navigations.js` as
`SCREEN_NAVIGATION` — navigate with the constant, never a string literal.

If you add accounts later, restore the gate by swapping the **entire
navigator** rather than pushing a Login screen: that is what makes logout
impossible to navigate back into.

### UI — React Native Reusables + NativeWind

RNR is **not a dependency**. It is a shadcn-style CLI that copies component
source into `src/components/ui/` as files you own:

```bash
npx @react-native-reusables/cli@latest add <name> --yes --styling-library nativewind
```

Its `doctor` reports three false positives here — it expects Expo Router's
`app/_layout.tsx` and `.ts` files at different paths. Setup is correct.

`src/components/ui/` is generated; `src/components/` is hand-written
composition. Both take `className` and merge it via `cn()` so callers can
override.

### Theming — read this before touching colors

- Colour is **Tailwind classes bound to CSS variables**. Tokens live once in
  `global.css` (`:root` light, `.dark:root` dark) and map to classes in
  `tailwind.config.js`. Use `bg-primary`, `text-muted-foreground`,
  `border-border` — never hardcoded hex.
- Tokens are declared with `<alpha-value>`, which is what makes the slash
  modifier work: `bg-primary/90`, `bg-destructive/10`.
- **`src/lib/theme.js` duplicates `global.css` on purpose.** CSS custom
  properties cannot be read from JS at runtime, but some APIs take colour
  *strings* and cannot take a class — lucide `color` props, `react-native-svg`
  fills, `StatusBar`, and the terminal's per-segment colours. Those use
  `useThemeColors()`. **Change a colour in one file and you must change it in
  the other.** There is no automation preventing drift.
- **Dark mode is class-based and driven by the app, not the OS.**
  `tailwind.config.js` sets `darkMode: "class"` and `App.js` calls NativeWind's
  `colorScheme.set()` from `useThemeStore`. Never use React Native's
  `useColorScheme()` — it reports the device and will desync from the toggle.
- Hardcoded hex is banned except the status set (success `#2E7D32`, warning
  `#E65100`, danger `#E53935`) — the token set has no semantic success/warning
  role and these must read identically in both themes.
- The **one other exception** is `TERMINAL_PALETTE` in `lib/theme.js`: the 16
  ANSI colours, one set per scheme. A remote shell sends `ESC[31m` and expects
  red; there is no token for "the colour the server asked for", and no class
  can carry a value chosen at runtime. Only `components/terminal/TerminalLine`
  may read it, via `useTerminalPalette()`.

The palette is the "Modern" system: monochrome zinc surfaces with a single green
accent. **`primary` is inverted** — near-black in light mode, near-white in dark
— and is the button colour. **Green is never a button**; it is only for section
ticks, status dots, focus rings and chips.

### Typography — the weight trap

Fonts are Onest + JetBrains Mono, loaded in `hooks/useAppFonts.js`. React Native
has **no synthetic weights**: each weight is a separately loaded family, so
Tailwind's `font-bold` / `font-semibold` utilities do nothing on their own. Use
the family classes — `font-sans`, `font-sans-medium`, `font-sans-semibold`,
`font-sans-bold`, `font-mono`. They are named that way to avoid colliding with
Tailwind's weight utilities.

Import fonts from their **per-weight subpath**
(`@expo-google-fonts/onest/600SemiBold`). The package root `require`s all nine
weights and ships ~576KB of unused `.ttf`.

### List/detail modules

`components/pattern/` is a kit for admin-style screens — header, stat row,
searchable card list, create/edit sheet. `Screens/Example/` is the reference
implementation to copy. See `docs/MODULE_PATTERN.md`, which also records what
changed from the web original (table → card list, drawer → full-screen sheet).

`DataList` is a `FlatList`. Never nest it in a `ScrollView` — put headers in
`ListHeaderComponent`.

`docs/DESIGN_GUIDELINES.md` is the full spec. `Screens/Example/` is the
reference for modules; `Screens/Ssh/` is the same pattern applied for real.
(The old standalone-screen reference was `Screens/Login/Index.js`, deleted with
auth — `Screens/Ssh/Terminal/` is the closest thing now.)

### Demo mode

`EXPO_PUBLIC_DEMO_MODE=true` forces every SSH session to use the mock
transport, so a build makes **no network connections at all** even with the
native module compiled in. It used to bypass auth as well; that half is gone.

The mock exposes the same interface as the real client, so nothing above
`services/ssh/` branches on which one it got. Keep it that way.

## Traps

**Tailwind classes only exist if the file is in `content`.** `tailwind.config.js`
scans `./App.js` and `./src/**/*`. A component outside those globs renders with
**no styles at all** and no error — the class string is simply never compiled.

**Never let a `transition-*` or `animate-*` class reach native.** Keep them
inside `Platform.select({ web: ... })`, which is what RNR does everywhere except
one spot. On native those classes make NativeWind's engine read a Reanimated
shared value during React render, and Reanimated 4 strict mode logs
`[Reanimated] Reading from 'value' during component render` on every state
change. It is `__DEV__`-only and harmless in production, but it is noisy and
cannot be fixed by upgrading — `nativewind@4.2.6` and
`react-native-css-interop@0.2.6` are both the latest published.
`src/components/ui/switch.jsx` carries a local fix for exactly this; re-adding
that file with the CLI's `--overwrite` will undo it.

**`KeyboardAvoidingView` does nothing on Android.** `behavior={undefined}` —
which is what `Platform.OS === "ios" ? "padding" : undefined` becomes there —
is not a lighter mode, it is no mode: the component renders a plain View and
defers to the window manager's `adjustResize`. That stopped working when
Android went edge-to-edge (the default since SDK 54), because the window is
already full-screen and has nothing left to resize. The keyboard then covers
bottom-anchored inputs outright. Pad with `useKeyboardInset()` instead — it
measures the keyboard and subtracts the safe-area inset. `App.js` must keep its
`SafeAreaProvider` or that hook has no insets to read.

**`@/` resolves through tsconfig `paths`, handled by Expo's Metro.** There is no
babel module-resolver. If aliases stop resolving, check `tsconfig.json` paths
rather than looking for a babel plugin.

**`EXPO_PUBLIC_*` is inlined at build time, not read at runtime.** A release
build made with `EXPO_PUBLIC_DEMO_MODE=true` can never open a real SSH
connection, and no runtime toggle can undo it.

**Dependencies that look unused but are not:** `react-native-pager-view`
(tab-view peer), `react-native-screens` (native-stack peer),
`react-native-reanimated` + `react-native-worklets` (babel plugin / peer),
`babel-preset-expo` (babel config), `expo-dev-client` (build-time),
`tailwindcss-animate` (tailwind plugin), `react-dom` + `react-native-web`
(`@rn-primitives/*` peers — without them hoisted, npm installs nested copies
and expo-doctor fails on duplicate native modules). Grep finds zero direct
imports for most of these.

**`android/` and `ios/` are gitignored.** They were committed once and silently
overrode `app.json`'s bundle ID. Regenerate with `prebuild`; never commit.

**Never `import` `@dylankenneally/react-native-ssh-sftp` at the top of a file.**
Its entry module runs `new NativeEventEmitter(NativeModules.RNSSHClient)` at
import time, and that throws on iOS when the native module is absent — which it
is in Expo Go, on web, and in any JS-only check. `services/ssh/nativeClient.js`
`require`s it lazily behind a `NativeModules` probe, and that is the only file
allowed to touch it.

**`expo-doctor` is 20/21, not 20/20**, because that package is flagged
"Untested on New Architecture". The warning is real and left unsilenced —
see [docs/SSH.md](docs/SSH.md#expo-doctor-reports-2021).

**SQLite's `datetime('now')` is UTC with a space and no zone marker.**
`new Date("2026-09-02 14:30:00")` reads it as *local* time, so every timestamp
is silently off by your UTC offset — and by zero in London, which is why it
survives review. Parse those columns with `parseSqliteDate` /
`formatRelativeTime` from `utils/dateFormat`.
