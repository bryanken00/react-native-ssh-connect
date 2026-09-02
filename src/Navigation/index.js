import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAVIGATION } from "../constants/navigations";
import { NAV_THEME } from "../lib/theme";
import SshHostsScreen from "../Screens/Ssh";
import TerminalScreen from "../Screens/Ssh/Terminal";
import useThemeStore from "../store/useThemeStore";

export const Stack = createNativeStackNavigator();

/**
 * One stack, two screens, no chrome around them.
 *
 * The template shipped a bottom tab bar and an `isAuthenticated` gate. Both are
 * gone: there is no account, and a tab bar with one destination is a row of
 * pixels that does nothing. The connection list *is* the home screen, and the
 * terminal pushes on top of it — so the back gesture ends the session and
 * returns to the list, which is the only navigation this app needs.
 *
 * `Screens/Example/` is still in the tree as the annotated reference for the
 * list-module pattern (see docs/MODULE_PATTERN.md), but nothing routes to it
 * any more — the Menu tab that used to was removed with the tab bar. Register
 * it below if you want to look at it running.
 *
 * To add a screen:
 *   1. Add its name to SCREEN_NAVIGATION in constants/navigations.js
 *   2. Import the component here
 *   3. Register it below
 *
 * Navigate with the constant, never a string literal:
 *   navigation.navigate(SCREEN_NAVIGATION.Ssh.Terminal, { hostId })
 */
const Navigation = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <NavigationContainer theme={isDarkMode ? NAV_THEME.dark : NAV_THEME.light}>
      <Stack.Navigator
        initialRouteName={SCREEN_NAVIGATION.Home}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name={SCREEN_NAVIGATION.Home}
          component={SshHostsScreen}
        />

        {/* Popping this closes the session — useSshSession tears the socket
            down on unmount. */}
        <Stack.Screen
          name={SCREEN_NAVIGATION.Ssh.Terminal}
          component={TerminalScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigation;
