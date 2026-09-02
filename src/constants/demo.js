/**
 * Fixtures used when `IS_DEMO` is on (see `constants/index.js`).
 *
 * Nothing here is reachable when demo mode is off — every consumer is behind
 * an `IS_DEMO` check in `services/requests/auth.js`. Delete this file and
 * those checks once you have a real backend.
 */

/** Fake latency, so loading states are actually visible while developing. */
export const DEMO_LATENCY_MS = 600;

/** Not a real credential — demo mode never sends it anywhere. */
export const DEMO_TOKEN = "demo-token-not-a-real-jwt";

/**
 * Shaped exactly like the object `useLoginAuth` builds from a real login
 * response, so screens cannot tell the difference.
 *
 * @param {string} email - whatever was typed on the login form
 */
export const makeDemoUser = (email) => ({
  userId: "demo-user-1",
  firstName: "Demo",
  lastName: "User",
  email: email || "demo@example.com",
  role: "admin",
  fullName: "Demo User",
  permissions: null,
});

/** Resolves after DEMO_LATENCY_MS — keeps demo mutations async like real ones. */
export const demoDelay = () =>
  new Promise((resolve) => setTimeout(resolve, DEMO_LATENCY_MS));
