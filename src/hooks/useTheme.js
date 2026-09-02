import { THEME, TERMINAL_PALETTE } from "@/lib/theme";
import useThemeStore from "@/store/useThemeStore";

/**
 * Resolved colour values for the active scheme.
 *
 * **Prefer Tailwind classes.** `className="bg-primary"` is the normal way to
 * colour something and needs nothing from this hook.
 *
 * Use this only where an API takes a colour *string* and cannot take a class:
 * lucide icon `color` props, `react-native-svg` fills, StatusBar, and gradient
 * stops.
 *
 *   const colors = useThemeColors();
 *   <Rocket color={colors.primary} />
 */
export const useThemeColors = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  return isDarkMode ? THEME.dark : THEME.light;
};

/**
 * The 16 ANSI colours for the active scheme.
 *
 * Only the terminal needs this. Everything else colours itself with a Tailwind
 * class — see the note on TERMINAL_PALETTE in lib/theme.js.
 */
export const useTerminalPalette = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  return isDarkMode ? TERMINAL_PALETTE.dark : TERMINAL_PALETTE.light;
};

/** Colours plus the toggle, for screens that render a theme switch. */
export const useAppTheme = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const setTheme = useThemeStore((s) => s.setTheme);

  return {
    colors: isDarkMode ? THEME.dark : THEME.light,
    isDarkMode,
    toggleTheme,
    setTheme,
  };
};

export default useAppTheme;
