import "./global.css";

import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { colorScheme } from "nativewind";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import Navigation from "./src/Navigation";
import { CustomDialogProvider } from "./src/hooks/useCustomDialog";
import { useAppFonts } from "./src/hooks/useAppFonts";
import { initDatabase } from "./src/store/database/initDatabase";
import useThemeStore from "./src/store/useThemeStore";

export const queryClient = new QueryClient();

// Keep the native splash up until fonts are ready, so the first painted frame
// is already in Onest rather than the system font.
SplashScreen.preventAutoHideAsync().catch(() => {
  /* no-op — already hidden, or called twice on fast refresh */
});

const AppContent = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const [fontsLoaded, fontError] = useAppFonts();

  // Tailwind config uses darkMode:"class", so NativeWind needs to be told which
  // scheme is active. This is what makes every `dark:` class in the app follow
  // the in-app toggle rather than the device setting.
  useEffect(() => {
    colorScheme.set(isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Create local SQLite tables, run migrations, add indexes.
  // Remove this if your app has no offline storage.
  useEffect(() => {
    initDatabase();
  }, []);

  // Drop the splash once fonts settle. `fontError` is included deliberately:
  // if a font fails we still show the app in a fallback face rather than
  // hanging on the splash forever.
  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <React.Fragment>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <SafeAreaView className="flex-1 bg-background">
        <GestureHandlerRootView className="flex-1">
          {/* CustomDialogProvider must stay mounted — useCustomDialog reads its context */}
          <CustomDialogProvider>
            <Navigation />
            <Toast />
          </CustomDialogProvider>
        </GestureHandlerRootView>
      </SafeAreaView>
      {/* PortalHost renders overlays (dialogs, popovers, selects) above
          everything else. It must be the last child of the providers. */}
      <PortalHost />
    </React.Fragment>
  );
};

export default function App() {
  return (
    // SafeAreaProvider is required for `useSafeAreaInsets()`. The `SafeAreaView`
    // below happens to work without it — it is a native view that pads itself —
    // but the hook has nothing to read and throws. `useKeyboardInset` needs the
    // bottom inset to know how far to actually lift content above the keyboard.
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
