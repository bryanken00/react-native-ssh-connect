/**
 * SCREEN_NAVIGATION
 *
 * Every route name in one place. Screens navigate with these constants, never
 * with string literals — a typo in a literal fails silently at runtime, a typo
 * here fails loudly as `undefined`.
 *
 * Group related routes into nested objects as the app grows, e.g.
 *
 *   export const SCREEN_NAVIGATION = {
 *     Home: "Home",
 *     Login: "Login",
 *     Account: {
 *       Profile: "Profile",
 *       ChangePassword: "ChangePassword",
 *     },
 *   };
 *
 * Access:
 *   SCREEN_NAVIGATION.Home
 *   SCREEN_NAVIGATION.Account.Profile
 */
export const SCREEN_NAVIGATION = {
  Home: "Home",
  Login: "Login",

  // Modules reached from the Menu tab, not from the tab bar itself.
  // Keep the tab bar for top-level destinations only.
  Modules: {
    Items: "Items",
  },
};
