import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SCREEN_NAVIGATION } from "../constants/navigations";
import { NAV_THEME } from "../lib/theme";
import ExampleScreen from "../Screens/Example";
import Home from "../Screens/Home";
import Login from "../Screens/Login/Index";
import useThemeStore from "../store/useThemeStore";
import { useUserAuthStore } from "../store/useUserAuthStore";

export const Stack = createNativeStackNavigator();

/**
 * Two stacks, switched on auth state. The whole navigator is swapped rather
 * than a screen pushed, so logging out cannot be navigated back into.
 *
 * To add a screen:
 *   1. Add its name to SCREEN_NAVIGATION in constants/navigations.js
 *   2. Import the component here
 *   3. Register it in the authenticated stack:
 *
 *      <Stack.Screen
 *        name={SCREEN_NAVIGATION.Profile}
 *        component={Profile}
 *      />
 *
 * Navigate with the constant, never a string literal:
 *   navigation.navigate(SCREEN_NAVIGATION.Profile)
 */
const Navigation = () => {
  const isAuthenticated = useUserAuthStore((s) => s.isAuthenticated);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  return (
    <NavigationContainer theme={isDarkMode ? NAV_THEME.dark : NAV_THEME.light}>
      {isAuthenticated ? (
        <Stack.Navigator
          initialRouteName={SCREEN_NAVIGATION.Home}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name={SCREEN_NAVIGATION.Home} component={Home} />

          {/* Modules — opened from the Menu tab. Delete with the example. */}
          <Stack.Screen
            name={SCREEN_NAVIGATION.Modules.Items}
            component={ExampleScreen}
          />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator initialRouteName={SCREEN_NAVIGATION.Login}>
          <Stack.Screen
            name={SCREEN_NAVIGATION.Login}
            options={{ headerShown: false }}
            component={Login}
          />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default Navigation;
