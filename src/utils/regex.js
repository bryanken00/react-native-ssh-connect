/**
 * Validation predicates. Every function here returns `true` when the value
 * **satisfies** the rule — `isValidEmail("a@b.com") === true`.
 *
 * Note the `hasX` password helpers are building blocks, not a policy. Compose
 * the rules your product actually needs rather than enforcing all of them.
 */

// Deliberately pragmatic, not RFC 5322. Rejects the common typos (missing @,
// missing TLD, spaces) without rejecting valid-but-unusual real addresses.
// The only authoritative check is sending mail to it.
const EMAIL =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/** true when `email` looks like a deliverable address */
export const isValidEmail = (email) => EMAIL.test(String(email ?? "").trim());

export const hasLowercase = (password) => /[a-z]/.test(password ?? "");
export const hasUppercase = (password) => /[A-Z]/.test(password ?? "");
export const hasNumber = (password) => /[0-9]/.test(password ?? "");
export const hasSpecialChar = (password) =>
  /[!@#$%^&)(+=.\-]/.test(password ?? "");

/** true when `password` is at least `min` characters */
export const hasMinLength = (password, min = 6) =>
  String(password ?? "").length >= min;
