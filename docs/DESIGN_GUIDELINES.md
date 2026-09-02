# Design Steering

The single source of truth for how screens should look and feel. The redesigned
**Login screen** ([src/Screens/Login/Index.js](../src/Screens/Login/Index.js)) is the
reference implementation — when in doubt, copy its patterns. The goal is a clean,
modern product built on [React Native Reusables](https://reactnativereusables.com)
that works in light **and** dark mode and looks correct on phones **and** tablets.

---

## 1. Principles

1. **Tailwind classes, never hardcoded hex.** Every colour is a token defined in
   [global.css](../global.css) and consumed as a class — `bg-primary`,
   `text-muted-foreground`, `border-border`. The only literal colours allowed are
   `#fff`/`#000` on top of a known brand surface (e.g. white on the primary
   button) and the fixed status set in §2.
2. **Vector icons only — no emoji.** Use [`lucide-react-native`](https://lucide.dev).
   Emoji (`✉ 🔒 👁`) render differently on every device and look unfinished.
3. **Motion is subtle and purposeful.** Entrance fades, focus transitions, press
   feedback. Nothing bounces for decoration. Durations stay in the 150–500ms range.
4. **Tablet-aware.** Constrain forms with `max-w-*` and centre them with
   `self-center`; never let a single column stretch edge-to-edge on a wide screen.
5. **Respect safe areas.** Full-screen screens wrap in `SafeAreaView`.
6. **Light + dark parity.** Every screen must be checked in both modes. Pick the
   semantic token that carries meaning, not the one that happens to look right in light.

---

## 2. Colour tokens

Tokens are declared once in [global.css](../global.css) as HSL triplets under
`:root` (light) and `.dark:root` (dark), and mapped to Tailwind colours in
[tailwind.config.js](../tailwind.config.js). Change a colour there and both
themes follow.

| Role | Class | Use for |
| --- | --- | --- |
| Action | `bg-primary` / `text-primary-foreground` | Primary buttons. **Inverted** — near-black in light mode, near-white in dark. Never pass a background. |
| Page background | `bg-background` / `text-foreground` | Screen background and body text |
| Card / sheet | `bg-card` / `text-card-foreground` | Raised containers |
| Overlay surface | `bg-popover` / `text-popover-foreground` | Dialogs, menus, sheets |
| Soft brand wash | `bg-secondary` / `text-secondary-foreground` | Field fills, decorative blobs, subtle badges |
| Muted | `bg-muted` / `text-muted-foreground` | Labels, captions, placeholders, inactive icons, disabled fills |
| Accent (green) | `bg-accent` | Section ticks, status dots, focus rings, chips. **Sparingly — never a button.** |
| Link | `text-link` | Text links |
| Mid text | `text-text-2` | Between foreground and muted |
| Row divider | `bg-line-soft` | Hairlines inside a card |
| Destructive | `bg-destructive` / `text-destructive-foreground` | Validation, destructive actions |
| Borders | `border-border` | Default borders and dividers |
| Field outline | `border-input` | Input borders |
| Focus ring | `ring-ring` | Focus indication |

**Opacity** uses the slash modifier, which is why every token is declared with
`<alpha-value>`: `bg-primary/90`, `bg-destructive/10`, `text-muted-foreground/60`.

**Status colours** (badges, banners) are the one sanctioned exception to the
tokens-only rule, because the token set has no semantic success/warning role. Use
this fixed set and nothing else — background / foreground: success
`#E8F5E9`/`#2E7D32`, warning `#FFF3E0`/`#E65100`, danger `#E53935` (or
`bg-destructive`). These are light-mode values; check them in both themes.

### When you cannot use a class

Some APIs take a colour **string** and cannot take a class — lucide icon `color`
props, `react-native-svg` fills and gradient stops, `StatusBar`, and
`react-native-tab-view`'s style objects. For those only, use:

```js
import { useThemeColors } from "@/hooks/useTheme";
const colors = useThemeColors();
<Rocket color={colors.primary} />
```

Those values come from [src/lib/theme.js](../src/lib/theme.js), a hand-maintained
JS mirror of `global.css`. **If you change a colour in one, change it in the
other** — CSS custom properties are not readable from JS at runtime, so this
duplication cannot be automated away.

### Dark mode

`tailwind.config.js` sets `darkMode: "class"`, and `App.js` calls NativeWind's
`colorScheme.set()` from `useThemeStore`. That is what makes `dark:` variants
follow the in-app toggle rather than the device setting — do not read
`useColorScheme()` from React Native directly, it reports the OS.

---

## 3. Components

Reach for [React Native Reusables](https://reactnativereusables.com) first — add
one with `npx @react-native-reusables/cli@latest add <name>`. Components land in
[src/components/ui/](../src/components/ui/) as ordinary files you own and can
edit; they are not a dependency.

Project-specific compositions live one level up in
[src/components/](../src/components/). Each accepts a `className` and merges it
with [`cn()`](../src/lib/utils.js), so a caller can always override:

```js
cn("px-4 py-2 bg-primary", isGhost && "bg-transparent", className)
```

`cn()` is `clsx` + `tailwind-merge`: later classes win conflicts. Plain string
concatenation would leave both `bg-` classes in place and let declaration order
decide.

For **list/detail modules** — the admin-style screens with a header, stat row,
searchable list and create/edit form — use the pattern kit in
[src/components/pattern/](../src/components/pattern/) and follow
[MODULE_PATTERN.md](MODULE_PATTERN.md). Don't rebuild those from primitives.

---

## 4. Layout & spacing

- Screen padding `p-4` for lists, `p-6` for centred single-column forms.
- Cards: `rounded-xl border border-border bg-card`, padding `p-5`–`p-7`.
- Forms and centred content: `w-full max-w-[440px] self-center`.
- Gaps over margins for rows — `flex-row items-center gap-2`.
- Inputs and primary buttons stand **54px** tall (`h-[54px]`) with `rounded-lg`;
  RNR's own `Button` defaults to `h-10` and is correct for secondary actions.

---

## 5. Typography

Use RNR's [`Text`](../src/components/ui/text.jsx) rather than React Native's, so
colour and size inherit through `TextClassContext` inside buttons and cards.

**Fonts are Onest (UI) and JetBrains Mono (numerals, ids, units)**, loaded in
[useAppFonts.js](../src/hooks/useAppFonts.js).

⚠️ **React Native has no synthetic weights.** Each weight is a separately loaded
family, so Tailwind's `font-bold` / `font-semibold` weight utilities do nothing
on their own. Select the *family* instead:

| Class | Family |
| --- | --- |
| `font-sans` | Onest 400 |
| `font-sans-medium` | Onest 500 |
| `font-sans-semibold` | Onest 600 |
| `font-sans-bold` | Onest 700 |
| `font-mono` | JetBrains Mono 400 |

The keys are deliberately not `medium`/`bold` — those would collide with
Tailwind's own weight utilities of the same name.

| Role | Classes |
| --- | --- |
| Page title | `font-sans-semibold text-[22px]` |
| Screen title | `font-sans-semibold text-xl` |
| Card heading | `font-sans-semibold text-[19px]` |
| Stat value | `font-sans-semibold text-[26px]` |
| Row title | `font-sans-medium text-[14px]` |
| Body | `text-sm leading-relaxed` |
| Field label | `font-sans-medium text-[13px]` |
| Section header | `font-sans-semibold text-[11px] uppercase tracking-[0.08em] text-muted-foreground` |
| Caption / footnote | `text-[11.5px] text-muted-foreground` |
| Row `#`, ids, units | `font-mono text-[12px] text-muted-foreground` |

---

## 6. Icons

- Library: **`lucide-react-native`**. Import named icons (tree-shaken).
- Default inline size **19**, `strokeWidth: 2`; 13–16 for captions/badges, 20–24 for nav.
- Colour comes from `useThemeColors()` — `colors.primary` when active,
  `colors.mutedForeground` when muted.
- Pass icon **components**, not elements or name strings, when a component takes
  an `icon` prop: `icon: Moon`, not `icon={<Moon />}` or `icon="moon"`.
- There is no icon font in this project. lucide renders SVG, so nothing needs
  linking and no `.ttf` ships.

---

## 7. Screen checklist

- [ ] Renders correctly in light **and** dark.
- [ ] Content is centred with a `max-w-*` on tablets.
- [ ] Safe areas respected; status bar style matches theme.
- [ ] Inputs: label above, focus ring, correct keyboard/capitalize, hitSlop on toggles.
- [ ] Primary action has press feedback + loading + disabled states.
- [ ] Heights/radii match the tokens (inputs & primary buttons `h-[54px]` / `rounded-lg`).
- [ ] Entrance + interaction motion present but subtle.
- [ ] No hardcoded hex outside the sanctioned status set.
- [ ] Icons are lucide vectors — zero emoji.

---

_Reference: [Login](../src/Screens/Login/Index.js) (full pattern set — gradient
logo mark, staggered entrance, styled inputs, primary button states) ·
[Dashboard](../src/Screens/Home/Dashboard/index.js) (header, card, tablet
`max-w`) · [Settings](../src/Screens/Home/Settings/index.js) (grouped list
sections, destructive action) · [global.css](../global.css) (tokens)._
