import { useFonts } from "expo-font";
// Import from the per-weight subpaths, NOT the package root.
// `@expo-google-fonts/onest` requires all nine weights in its index, so a root
// import ships ~576KB of .ttf you never use. These subpaths pull one file each.
import { Onest_400Regular } from "@expo-google-fonts/onest/400Regular";
import { Onest_500Medium } from "@expo-google-fonts/onest/500Medium";
import { Onest_600SemiBold } from "@expo-google-fonts/onest/600SemiBold";
import { Onest_700Bold } from "@expo-google-fonts/onest/700Bold";
import { JetBrainsMono_400Regular } from "@expo-google-fonts/jetbrains-mono/400Regular";

/**
 * Loads the Modern pattern's typefaces: Onest for UI, JetBrains Mono for
 * numerals, ids and units.
 *
 * React Native has no synthetic weights — each weight is a distinct family that
 * must be loaded by name and selected with a `font-sans-*` class. Registering
 * only Regular and then writing `font-bold` gets you nothing.
 *
 * Returns [loaded, error]. Hold the splash screen until it is true, otherwise
 * the first frame renders in the system font and visibly reflows.
 */
export const useAppFonts = () =>
  useFonts({
    Onest_400Regular,
    Onest_500Medium,
    Onest_600SemiBold,
    Onest_700Bold,
    JetBrainsMono_400Regular,
  });

export default useAppFonts;
