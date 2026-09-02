import { DarkTheme, DefaultTheme } from "@react-navigation/native";

/**
 * JavaScript mirror of the CSS variables in global.css.
 *
 * ⚠️ These values are duplicated by necessity: CSS custom properties live in
 * the NativeWind style engine and cannot be read from JS at runtime, but
 * React Navigation needs plain colour strings for its container theme, and
 * some APIs (lucide `color`, svg fills, StatusBar, the terminal's per-segment
 * text colours) take colours as props rather than classes.
 *
 * If you change a colour in global.css, change it here too. Anything you can
 * express as a `className` should use the class and never touch this file.
 */
export const THEME = {
  light: {
    background: "hsl(0 0% 98%)",
    foreground: "hsl(240 5.9% 10%)",
    card: "hsl(0 0% 100%)",
    cardForeground: "hsl(240 5.9% 10%)",
    primary: "hsl(240 5.9% 10%)",
    primaryForeground: "hsl(0 0% 98%)",
    secondary: "hsl(240 4.8% 95.9%)",
    secondaryForeground: "hsl(240 5.9% 10%)",
    muted: "hsl(240 4.8% 95.9%)",
    mutedForeground: "hsl(240 3.8% 46.1%)",
    accent: "hsl(141.9 69.2% 58%)",
    accentForeground: "hsl(142.4 71.8% 29.2%)",
    destructive: "hsl(0 72.2% 50.6%)",
    destructiveForeground: "hsl(0 0% 98%)",
    border: "hsl(240 5.9% 90%)",
    input: "hsl(240 5.9% 90%)",
    ring: "hsl(141.9 69.2% 58%)",
    text2: "hsl(240 3.7% 15.9%)",
    lineSoft: "hsl(240 4.8% 95.9%)",
    link: "hsl(142.1 76.2% 36.3%)",
  },
  dark: {
    background: "hsl(240 10% 3.9%)",
    foreground: "hsl(0 0% 98%)",
    card: "hsl(240 7.3% 8%)",
    cardForeground: "hsl(0 0% 98%)",
    primary: "hsl(0 0% 98%)",
    primaryForeground: "hsl(240 5.9% 10%)",
    secondary: "hsl(240 6.1% 12.9%)",
    secondaryForeground: "hsl(0 0% 98%)",
    muted: "hsl(240 6.1% 12.9%)",
    mutedForeground: "hsl(240 5% 64.9%)",
    accent: "hsl(141.9 69.2% 58%)",
    accentForeground: "hsl(141.9 69.2% 58%)",
    destructive: "hsl(0 90.6% 70.8%)",
    destructiveForeground: "hsl(240 5.9% 10%)",
    border: "hsl(240 3.7% 15.9%)",
    input: "hsl(240 3.7% 15.9%)",
    ring: "hsl(141.9 69.2% 58%)",
    text2: "hsl(240 5% 64.9%)",
    lineSoft: "hsl(240 3.7% 15.9%)",
    link: "hsl(141.9 69.2% 58%)",
  },
};

/**
 * The 16 ANSI colours a terminal needs, per scheme.
 *
 * This is the one place hardcoded colour is unavoidable: a remote shell sends
 * `ESC[31m` and expects red — there is no token for "the colour the server
 * asked for", and no className can carry a value decided at runtime. The
 * terminal parser stores palette *names*; `TerminalLine` resolves them here at
 * render, so a theme toggle re-colours scrollback that has already arrived.
 *
 * Both sets are tuned for their own background: the light set is darkened so
 * yellow and cyan stay legible on `--background: 0 0% 98%`, the dark set is
 * the familiar bright xterm ramp. `foreground` is the colour of unstyled
 * output and deliberately matches THEME.*.foreground.
 *
 * Anything a *chrome* element needs (headers, buttons, status) belongs in
 * THEME above and should be a Tailwind class at the call site. Only bytes that
 * came off the wire use this.
 */
export const TERMINAL_PALETTE = {
  light: {
    foreground: "#18181b",
    black: "#27272a",
    red: "#b91c1c",
    green: "#15803d",
    yellow: "#a16207",
    blue: "#1d4ed8",
    magenta: "#a21caf",
    cyan: "#0e7490",
    white: "#71717a",
    brightBlack: "#52525b",
    brightRed: "#dc2626",
    brightGreen: "#16a34a",
    brightYellow: "#ca8a04",
    brightBlue: "#2563eb",
    brightMagenta: "#c026d3",
    brightCyan: "#0891b2",
    brightWhite: "#18181b",
  },
  dark: {
    foreground: "#fafafa",
    black: "#3f3f46",
    red: "#f87171",
    green: "#4ade80",
    yellow: "#fbbf24",
    blue: "#60a5fa",
    magenta: "#e879f9",
    cyan: "#22d3ee",
    white: "#d4d4d8",
    brightBlack: "#71717a",
    brightRed: "#fca5a5",
    brightGreen: "#86efac",
    brightYellow: "#fcd34d",
    brightBlue: "#93c5fd",
    brightMagenta: "#f0abfc",
    brightCyan: "#67e8f9",
    brightWhite: "#ffffff",
  },
};

/**
 * Themes for NavigationContainer. Spread from React Navigation's defaults so
 * the `fonts` key it requires in v7 is present.
 */
export const NAV_THEME = {
  light: {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: THEME.light.background,
      border: THEME.light.border,
      card: THEME.light.card,
      notification: THEME.light.destructive,
      primary: THEME.light.primary,
      text: THEME.light.foreground,
    },
  },
  dark: {
    ...DarkTheme,
    colors: {
      ...DarkTheme.colors,
      background: THEME.dark.background,
      border: THEME.dark.border,
      card: THEME.dark.card,
      notification: THEME.dark.destructive,
      primary: THEME.dark.primary,
      text: THEME.dark.foreground,
    },
  },
};
