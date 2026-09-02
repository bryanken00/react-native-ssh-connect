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
  /** The saved-connections list. There is no tab bar — this is the app. */
  Home: "Home",

  // The terminal is pushed on top of Home, so the back gesture ends the
  // session and returns to the list.
  Ssh: {
    Terminal: "Terminal",
  },
};
