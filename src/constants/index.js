/**
 * App-wide constants.
 *
 * API host comes from the environment so the same build config works for
 * local, staging and production. Copy `.env.example` to `.env` and set it.
 *
 * Expo inlines any variable prefixed `EXPO_PUBLIC_` at build time. That means
 * it ends up readable inside the shipped bundle — put API hosts and feature
 * flags here, never secrets.
 *
 * Changing .env requires restarting the bundler with `npx expo start --clear`.
 */
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

/** Where the API serves uploaded/static files from. */
export const BASE_URL_FILES = `${BASE_URL}/public`;

/**
 * Demo mode — every SSH session is simulated and **no network traffic leaves
 * the device**, even in a build that has the native SSH module.
 *
 * This used to mean "bypass the login form" as well. There is no login any
 * more, so it now has exactly one job: force `services/ssh` to pick the mock
 * transport. Use it to record a walkthrough or hand someone a build you do not
 * want pointed at real servers.
 *
 * Env vars arrive as strings, so `"false"` would be truthy — compare exactly.
 *
 * ⚠️ Inlined at build time, not read at runtime. A release built with this set
 * can never make a real connection, and no in-app toggle can undo it.
 */
export const IS_DEMO = process.env.EXPO_PUBLIC_DEMO_MODE === "true";
