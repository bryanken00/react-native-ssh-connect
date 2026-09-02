# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Read [docs/ENGINEERING_CHECKLIST.md](docs/ENGINEERING_CHECKLIST.md) before
> writing code.** It is the standing bar for every change here: reuse what
> exists, what a fetch and a render cost, layout down to 320px and up to a
> tablet, and the loading/empty/error states a screen owes. §10 lists the
> repo's measured gaps. Visual rules are in
> [docs/DESIGN_GUIDELINES.md](docs/DESIGN_GUIDELINES.md); list-module structure
> is in [docs/MODULE_PATTERN.md](docs/MODULE_PATTERN.md).

## What this repo is

A **starter template**, not a product. Expo SDK 57 / React Native 0.86, plain
JavaScript (no `.tsx`). UI is [React Native Reusables](https://reactnativereusables.com)
on NativeWind (Tailwind v3). It ships auth, theming, navigation, data fetching
and offline SQLite, with no example domain.

Consequences for how you work here:

- Several files exist **to be deleted by whoever clones this**:
  `store/database/tables/example.table.js`,
  `store/database/endpoints/example.endpoints.js`, `constants/demo.js`, and
  `Screens/Home/Dashboard/` (a placeholder). Don't build on them; don't treat
  them as dead code either.
- 18 files under `src/` are unreachable from `index.js` **by design** — every
  `utils/*`, `useCamera`, `LoadingScreen`, `DateRangePicker`, `version.js`, the
  SQLite examples, and any `components/ui/*` not yet used on a screen. They're
  a kit for the next developer. "Unused" is not a defect here.
- Doc comments carry more weight than usual: they're the product. Match the
  existing density rather than trimming them.

## Commands

```bash
npm start              # expo start --clear
npm run android        # expo run:android  (needs a prebuild + native toolchain)
npm run ios
npm run web
```

**There is no test framework, linter or formatter configured.** No jest, no
eslint, no prettier. Do not invent `npm test` — it does not exist. The actual
verification loop is:

```bash
npx expo-doctor@latest                      # 20/20 expected
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

Demo mode's bypass lives in `requests/`, not `api/`, for this reason: `api/`
describes the server, and a fake user is not something the server does.

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

`Navigation/index.js` swaps the **entire navigator** on `isAuthenticated`
rather than pushing a screen, so logout cannot be navigated back into. Route
names live in `constants/navigations.js` as `SCREEN_NAVIGATION` — navigate with
the constant, never a string literal.

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
  fills, `StatusBar`, and `react-native-tab-view` style objects. Those use
  `useThemeColors()`. **Change a colour in one file and you must change it in
  the other.** There is no automation preventing drift.
- **Dark mode is class-based and driven by the app, not the OS.**
  `tailwind.config.js` sets `darkMode: "class"` and `App.js` calls NativeWind's
  `colorScheme.set()` from `useThemeStore`. Never use React Native's
  `useColorScheme()` — it reports the device and will desync from the toggle.
- Hardcoded hex is banned except the status set (success `#2E7D32`, warning
  `#E65100`, danger `#E53935`) — the token set has no semantic success/warning
  role and these must read identically in both themes.

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

`docs/DESIGN_GUIDELINES.md` is the full spec. `Screens/Login/Index.js` is the
reference for standalone screens, `Screens/Example/` for modules.

### Demo mode

`EXPO_PUBLIC_DEMO_MODE=true` makes all four auth hooks resolve locally with
zero network calls. Demo returns the **same response shape** as the real API,
so `onSuccess` needs no branch and every downstream behaviour is identical.
Keep it that way when adding auth surface.

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

**`@/` resolves through tsconfig `paths`, handled by Expo's Metro.** There is no
babel module-resolver. If aliases stop resolving, check `tsconfig.json` paths
rather than looking for a babel plugin.

**`EXPO_PUBLIC_*` is inlined at build time, not read at runtime.** A release
build made with `EXPO_PUBLIC_DEMO_MODE=true` ships with auth permanently
bypassed and no runtime toggle can undo it.

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
