# Engineering Checklist

Read this **before writing code**, not after. It is the standing set of things
to check on every change in this repo — reuse, data access, rendering cost,
responsiveness, and the states every screen owes its user.

Design and visual rules live in [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md).
List-module structure lives in [MODULE_PATTERN.md](MODULE_PATTERN.md). This file
is about how the code behaves.

---

## 0. The four questions

Ask these before adding a file:

1. **Does it already exist?** → §1
2. **What does it cost to fetch?** → §2
3. **What does it cost to render?** → §3
4. **What does it look like at 320px, at 900px, and while loading?** → §4, §6

---

## 1. Reuse first

Nothing gets written twice. Check in this order:

| Need | Look in |
| --- | --- |
| Button, Input, Switch, Card, Text, Dialog, Badge, Avatar | `components/ui/` (RNR — add more with the CLI, don't hand-roll) |
| Header, grouped list, dialog, loader, date range, logo | `components/` |
| List screen, stat card, filter bar, form sheet, FAB, status dot | `components/pattern/` |
| Theme colours, dark-mode flag | `hooks/useTheme` |
| Dates, validation, formatting, error handling, ids | `utils/` |
| Auth, API calls | `services/api/` + `services/requests/` |
| Local reads/writes | `store/database/endpoints/` |

- [ ] Searched the table above before creating anything new
- [ ] New shared component accepts `className` and merges via `cn()`
- [ ] New shared component reads theme itself — **never** takes a `colors` prop
- [ ] Util is a pure function: no store reads, no toasts, no navigation
- [ ] Used **twice** → extract. Used **once** → leave it where it is.

Extracting too early is as costly as not extracting: a wrong abstraction is
harder to unpick than a duplicate.

---

## 2. Data & API

**Never fetch in `useEffect`.** Use `useQuery`; it handles caching,
deduplication, cancellation on unmount, and refetch-on-reconnect for free.

- [ ] Query keys are hierarchical and include every input:
      `["items", { page, search, status }]` — not `["items"]`
- [ ] `enabled` guards queries that depend on data not yet available
      (`enabled: !!userId`) instead of firing and discarding
- [ ] Server-side search/filter/paging where the API supports it; filtering a
      full dataset client-side only works until it doesn't
- [ ] Long lists use `useInfiniteQuery`, not manual page state
- [ ] Mutations `invalidateQueries` on success — or `setQueryData` for an
      optimistic update, with a rollback in `onError`
- [ ] No fetching inside `renderItem`. One request per list, never per row.
- [ ] Side effects (toast, store write, navigation) live in `requests/`,
      never in `api/`
- [ ] `retry` does not re-send on 4xx — a 401 or 422 will never succeed by
      being repeated
- [ ] Offline-capable screens read SQLite first and treat the network as a
      refresh, not a prerequisite

**Set `QueryClient` defaults.** Out of the box `staleTime: 0` means every mount
refetches, and `retry: 3` retries client errors. Decide those once, globally.

---

## 3. Rendering cost

- [ ] Lists use `FlatList` (via `DataList`) — never `ScrollView` + `.map()`
- [ ] `keyExtractor` returns a stable id, **not** the array index
- [ ] Row components are wrapped in `React.memo`; a list re-render should not
      re-render every row
- [ ] Fixed-height rows declare `getItemLayout` — it removes on-the-fly
      measurement and makes scrolling to an offset instant
- [ ] `renderItem` does not allocate a new closure per row where it can be
      hoisted
- [ ] Zustand is read with a **narrow selector** — `useStore(s => s.field)`,
      never `useStore()`, which re-renders on every unrelated change
- [ ] `useMemo`/`useCallback` used for genuinely expensive work or referential
      stability, not sprinkled by habit
- [ ] Images use `expo-image` with explicit dimensions
- [ ] Nothing heavy runs during render — derive, don't compute

---

## 4. Responsiveness — layout

- [ ] `useWindowDimensions()`, never `Dimensions.get()` — the latter does not
      update on rotation or split-screen
- [ ] Content constrained with `max-w-*` + `self-center`; no single column
      stretched across a tablet
- [ ] No hardcoded pixel widths for containers — `flex-1`, `min-w-[45%]`, `gap-*`
- [ ] Checked at ~320px (small phone) **and** in landscape
- [ ] Long strings have `numberOfLines` and can truncate without breaking layout
- [ ] Text survives a large system font size — test with OS font scaling at max
- [ ] `SafeAreaView` on full-screen screens; `KeyboardAvoidingView` on forms
- [ ] Touch targets ≥ 44px, or `hitSlop` to reach it

---

## 5. Responsiveness — interaction

The UI must answer within ~100ms even when the work does not.

- [ ] Every async action has a visible pending state — spinner, disabled, or
      skeleton
- [ ] Search and filter inputs are **debounced** (~300ms) before triggering a
      query or a filter over a large set
- [ ] Destructive actions confirm first
- [ ] Optimistic updates where the server outcome is near-certain
- [ ] Nothing blocks the JS thread — defer heavy work with
      `InteractionManager.runAfterInteractions`
- [ ] Animations use the native driver (`useNativeDriver: true`) unless
      animating a colour
- [ ] Timers, subscriptions and listeners are cleaned up in the `useEffect`
      return

---

## 6. The three states every screen owes

A screen is not done when the happy path renders.

- [ ] **Loading** — first load and refetch are visually distinct
- [ ] **Empty** — with a different message when filters are active vs genuinely
      no data (`EmptyState` supports this)
- [ ] **Error** — surfaced to the user, not only to `console.log`
- [ ] Partial failure does not blank the whole screen

---

## 7. Accessibility

- [ ] Icon-only controls have `accessibilityLabel` — an unlabelled icon button
      is invisible to a screen reader
- [ ] Interactive elements declare `accessibilityRole`
- [ ] Toggles and busy buttons report `accessibilityState`
- [ ] Colour is never the only signal — pair status dots with text or shape
- [ ] Contrast checked in **both** themes, not just the one you are working in

---

## 8. Platform & bundle

- [ ] `transition-*` / `animate-*` classes stay inside
      `Platform.select({ web: … })` — see CLAUDE.md for why
- [ ] `Platform.select` for anything with real OS divergence
- [ ] New dependency justified: is it maintained, and what does it add to the
      bundle?
- [ ] Assets imported from their narrowest path — check the asset list printed
      by `npx expo export` after adding any
- [ ] Nothing secret in `EXPO_PUBLIC_*` — it is inlined into the shipped bundle

---

## 9. Before you ship

```bash
npx expo-doctor@latest        # expect 20/20
npx expo export --platform android --clear
```

- [ ] Doctor passes
- [ ] Bundle succeeds, and the asset list contains what you expect and nothing more
- [ ] Checked in light **and** dark
- [ ] Actually ran the change on a device — a bundle proves it *resolves*, not
      that it *behaves*

---

## 10. Known gaps in this repo

Measured, not assumed. Fix when the relevant screen matters; each is a
deliberate to-do, not an oversight.

| Gap | Where | Impact |
| --- | --- | --- |
| `new QueryClient()` has no defaults | [App.js](../App.js) | `staleTime: 0` refetches on every mount; `retry: 3` retries 4xx |
| No `React.memo` on rows | [DataListRow.js](../src/components/pattern/DataListRow.js) | Every row re-renders when any list state changes |
| No `getItemLayout` / windowing props | [DataList.js](../src/components/pattern/DataList.js) | Fine at 5 rows, degrades in the hundreds |
| Search is not debounced | [FilterBar.js](../src/components/pattern/FilterBar.js) | Filters on every keystroke; becomes a request per keystroke once wired to an API |
| Only the tab shell reads `useWindowDimensions` | [Home/index.js](../src/Screens/Home/index.js) | Nothing else adapts to width; tablet layout is `max-w-*` only |
| No error state in the example module | [Screens/Example/](../src/Screens/Example/) | In-memory data cannot fail — add one when you wire a real API |
