# Modern Module Pattern — React Native

How to build an admin-style **list screen** and its **create/edit sheet**:
Onest + monochrome surfaces + green accent, hairline borders, no shadows.

Ported from a web design system built on Ant Design; §1 records what had to
change for a phone and why. This document is self-contained — you do not need
the web original to use it.

[src/Screens/Example/](../src/Screens/Example/) is the reference
implementation; copy that folder to start a module.

> Everything visual is driven by tokens in [global.css](../global.css).
> **Never hardcode a hex in a screen.**

---

## 1. What changed from the web pattern, and why

| Web | React Native | Why |
| --- | --- | --- |
| Ant `<Table>`, 5 columns | `DataList` + `DataListRow` card list | Five columns are unreadable at 390px. Same fields, stacked. |
| Right `<Drawer width={480}>` | `FormSheet` — full-screen modal | A side drawer has nowhere to sit on a phone. |
| Numbered pager + `10 / page` | `ListFooter` — count + prev/next | Page-size is a desktop affordance; arrows and a count are enough. Swap for `onEndReached` if you want infinite scroll. |
| Toolbar: input left, buttons right | Search row, buttons trailing | At phone width a 280px input plus two buttons leaves nothing for the input. |
| Root `p-8` | `p-4` | 32px of padding costs ~16% of a phone's width. |
| `hover:` states | `active:` states | There is no hover on touch. |
| Stat cards `Col lg={8}` ×3 | `flex-row flex-wrap`, `min-w-[45%]` | Two-up on phones, three-up when it fits. |
| Large title + subtitle in the page body | Fixed `ScreenHeader`, no subtitle | Reclaims ~130px, keeps the title visible while scrolling, and matches every other screen. |
| `New …` button in the header | Flat `Fab`, bottom-right | Stays reachable at any scroll position. Flat, not elevated — the system bans shadows. |

Everything else — tokens, typography, the accent tick, status dots, the
segmented toggle, the inverted primary button — carries over unchanged.

---

## 2. Design system

**Fonts.** Onest (UI) and JetBrains Mono (`#`, ids, units), loaded in
[useAppFonts.js](../src/hooks/useAppFonts.js) and held behind the splash screen
until ready.

React Native has **no synthetic weights** — each weight is a separately loaded
family, so `font-bold` (a weight utility) does nothing on its own. Pick the
family:

| Class | Family | Use |
| --- | --- | --- |
| `font-sans` | Onest 400 | body |
| `font-sans-medium` | Onest 500 | labels, row titles |
| `font-sans-semibold` | Onest 600 | headings, values |
| `font-sans-bold` | Onest 700 | page titles |
| `font-mono` | JetBrains Mono 400 | row `#`, ids, units |

> Import fonts from their **per-weight subpath**
> (`@expo-google-fonts/onest/600SemiBold`). The package root requires all nine
> weights and ships ~576KB of unused `.ttf`.

**Accent.** Green `--accent`, used *sparingly* — section ticks, status dots,
focus rings, chips. **Never a button colour.**

**Primary is inverted.** Near-black button with light text in light mode,
near-white with dark text in dark mode. That is just `<Button>` — never pass a
background.

**Cards/panels.** `border border-border rounded-[14px]`, **no shadow**.

### Token cheat-sheet

| Class | Use |
| --- | --- |
| `bg-background` | page canvas |
| `bg-card` | cards, list rows, sheets |
| `bg-secondary` / `bg-muted` | wells, segmented track, pressed states |
| `border-border` | hairline borders |
| `bg-line-soft` | row dividers inside a card |
| `text-foreground` | primary text / values |
| `text-text-2` | mid text |
| `text-muted-foreground` | captions, icons, `#`, units |
| `bg-accent` | accent — ticks, dots, focus |
| `text-link` | text links |
| `rounded-[14px]` card · `rounded-lg` control | radii |

---

## 3. Where a module lives

**There is no tab bar any more.** It was removed once this app had a single
destination — see the note in [Navigation/index.js](../src/Navigation/index.js).
A module is a screen pushed onto the stack:

1. Name the route in [constants/navigations.js](../src/constants/navigations.js)
2. Register the screen in [Navigation/index.js](../src/Navigation/index.js)
3. Give it an entry point — a row on the home screen, a header action, or a
   `GroupedList` on a settings screen if you add one back
   ([GroupedList](../src/components/GroupedList.js) is still in the kit)

If you ever get back to three or more top-level destinations, a bottom tab bar
is the right answer and `react-native-tab-view` is still installed. Two is not
enough to earn one.

The navigator runs with `headerShown: false`, so **pass `onBack` to
`ScreenHeader`** — it is the only way back off the screen.

---

## 4. List screen skeleton

Fixed `ScreenHeader` → stat row → **one list card** holding toolbar, rows and
footer → floating `Fab`.

The title lives in a **fixed** [`ScreenHeader`](../src/components/ScreenHeader.js)
outside the list, so it stays put while rows scroll. That is the same header
every other screen uses — there is deliberately no separate large-title header
for modules, and no subtitle: on a list screen it costs a row of content and
says little.

The create action is a flat [`Fab`](../src/components/pattern/Fab.js) rather
than a header button, so it stays reachable however far you have scrolled.
Because it floats, the list **must** reserve room for it — pass `FAB_CLEARANCE`
as `contentContainerClassName`, or the FAB will sit on top of the pager.

`DataList` is a `FlatList`, so **do not wrap the screen in a ScrollView** —
put the header and stat cards in `ListHeaderComponent`. Nesting the two breaks
virtualisation and warns at runtime.

```jsx
<View className="bg-background flex-1">
  <ScreenHeader title="Items" onBack={navigation.goBack} />

  <DataList
    data={m.pageItems}
    keyExtractor={(item) => item.itemId}
    contentContainerClassName={FAB_CLEARANCE}
    renderItem={({ item, index }) => (
      <DataListRow
        index={(m.page - 1) * m.pageSize + index + 1}
        title={item.name}
        subtitle={item.description}
        status={item.status}
        onPress={() => m.openEdit(item)}
        onMenu={() => confirmDelete(item)}
      />
    )}
    ListHeaderComponent={
      <View className="flex-row flex-wrap gap-3 pb-5">
        <StatCard title="Total items" value={12} change="all time"
                  icon={Package} className="min-w-[45%] flex-1" />
        {/* …two more… */}
      </View>
    }
    toolbar={<FilterBar … >{showFilters && <StatusToggle …/>}</FilterBar>}
    empty={<EmptyState … />}
    footer={<ListFooter page={m.page} total={m.total} noun="item" … />}
  />

  <Fab label="New item" icon={Plus} onPress={m.openCreate} />

  <ExampleFormSheet open={m.editing !== null} … />
</View>
```

Rules:

- `ScreenHeader` and `Fab` are siblings of `DataList`, **not** inside it — one
  stays pinned to the top, the other to the bottom.
- The toolbar lives **inside** the card, as `DataList`'s `toolbar` prop.
- Rows carry the card's side borders; the toolbar rounds the top and the footer
  rounds the bottom. That is handled by `DataList` — don't re-border rows.
- No shadow on the card or the FAB; hairline border only.

---

## 5. Row anatomy

The web's five columns become two lines plus trailing status and menu:

```
 01  ┌──┐  Aluminium Bracket          ●  ⋮
     │ A│  Structural mounting part
     └──┘
  │    │         │                    │  │
 mono  avatar   title / subtitle    dot  menu
```

`DataListRow` takes `{ index, title, subtitle, status, active, onPress, onMenu }`.
Swap the fields per module and keep the shape. Omit `index` if a running number
adds nothing.

The example's records are shaped `{ itemId, name, description, status }` —
deliberately the same shape as the local `items` table, so replacing the
in-memory array in
[useExampleModule.js](../src/Screens/Example/useExampleModule.js) with
`db_getItems()` from
[example.endpoints.js](../src/store/database/endpoints/example.endpoints.js) is
a drop-in swap rather than a rewrite.

---

## 6. Create / edit sheet

Follow [ExampleFormSheet.js](../src/Screens/Example/ExampleFormSheet.js). Props
are `{ open, onClose, onSubmit, entity }` — the sheet owns its own `FormSheet`.

- **Header** — accent-free primary chip + title + subtitle + bordered X. Handled
  by `FormSheet`; pass `icon`, `title`, `subtitle`.
- **Sections** — `<SectionLabel>` (uppercase + accent tick) between groups,
  never a divider line.
- **Fields** — `Label` + `Input`, `h-12`, stacked with `gap-4`. Show a counter
  under textareas.
- **On/off choices** — `StatusToggle`, not a picker. A two-way choice should not
  cost a modal round-trip.
- **Footer** — Cancel (outline) + primary, both `flex-1`. Keep the dirty-check
  disable: the save button stays disabled until something actually changes.

---

## 7. Conversion checklist (per module)

**Wiring**

- [ ] Route named in `SCREEN_NAVIGATION`, screen registered in `Navigation/index.js`
- [ ] Reachable from somewhere — a pushed screen nothing links to is dead code
- [ ] `onBack={navigation.goBack}` on `ScreenHeader`

**List screen (`index.js`)**

- [ ] `DataList` as the root scroller — no wrapping ScrollView
- [ ] Fixed `ScreenHeader` outside the list; stat row inside `ListHeaderComponent`
- [ ] Stat cards `flex-row flex-wrap gap-3`, each `min-w-[45%] flex-1`
- [ ] `FilterBar` passed as `toolbar`
- [ ] `EmptyState` passed as `empty`, with a different message when filters are active
- [ ] `ListFooter` passed as `footer` (or `onEndReached` for infinite scroll)
- [ ] `Fab` as a sibling of `DataList`, with `FAB_CLEARANCE` on contentContainerClassName

**Rows**

- [ ] `DataListRow`: mono `#` · initial avatar · title/subtitle · status dot · `⋮`
- [ ] Row tap opens edit; `⋮` opens destructive actions
- [ ] Sentence-case titles ("Item name")

**Sheet (`…FormSheet.js`)**

- [ ] Props `{ open, onClose, onSubmit, entity }`; owns its `FormSheet`
- [ ] `SectionLabel` per group
- [ ] `StatusToggle` for on/off, not a picker
- [ ] Footer: Cancel + primary, dirty-check disable
- [ ] State lives in a `use<Module>.js` hook, not the screen

**Never**

- [ ] Hardcode a hex — use tokens
- [ ] Put a background on the primary button
- [ ] Add a shadow, gradient or pastel chip
- [ ] Use green for a button
- [ ] Use `font-bold` expecting a bold face — use `font-sans-bold`
- [ ] Let a `transition-*` class reach native (see CLAUDE.md)

---

_Reference: [Example module](../src/Screens/Example/) ·
[pattern components](../src/components/pattern/) ·
[global.css](../global.css) · [DESIGN_GUIDELINES.md](DESIGN_GUIDELINES.md)_
