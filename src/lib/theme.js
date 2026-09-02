import { DarkTheme, DefaultTheme } from "@react-navigation/native";

/**
 * JavaScript mirror of the CSS variables in global.css.
 *
 * ⚠️ These values are duplicated by necessity: CSS custom properties live in
 * the NativeWind style engine and cannot be read from JS at runtime, but
 * React Navigation needs plain colour strings for its container theme, and
 * some APIs (lucide `color`, svg fills, StatusBar, react-native-tab-view)
 * take colours as props rather than classes.
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
