/**
 * Date formatting helpers built on the platform `Intl` API — no date library.
 *
 * Hermes ships full ICU on both platforms, so `Intl.DateTimeFormat` and
 * `toLocaleDateString` work in React Native without a polyfill.
 */

/** Locale used by every helper here. Change once, applies everywhere. */
const LOCALE = "en-US";

/**
 * Compact date: omits the year for anything within the last 12 months,
 * includes it otherwise.
 *   recent -> "Jan 9"      older -> "Jan 9, 2023"
 */
export const localizeDate = (date) => {
  const d = new Date(date);

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return d.toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    ...(d >= oneYearAgo ? {} : { year: "numeric" }),
  });
};

/**
 * Time of day. Pass a `timeZone` (e.g. "Asia/Manila", "UTC") to format in a
 * fixed zone instead of the device's.
 *   -> "09:41 AM"
 */
export const formatTime = (date = new Date(), timeZone) => {
  const parts = new Intl.DateTimeFormat(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...(timeZone ? { timeZone } : {}),
  }).formatToParts(new Date(date));

  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const ap = parts.find((p) => p.type === "dayPeriod")?.value ?? "AM";

  return `${hh}:${mm} ${ap}`;
};

/** -> "Jan 9, 09:41 AM" */
export const formatShortDateTime = (dateString) =>
  new Date(dateString).toLocaleDateString(LOCALE, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/** -> "Monday, January 9, 2026" */
export const formatLongDate = (dateString) =>
  new Date(dateString).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/** -> "Monday, January 9, 2026, 09:41 AM" */
export const formatLongDateTime = (dateString) =>
  new Date(dateString).toLocaleDateString(LOCALE, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

/**
 * Parse a timestamp written by SQLite's `datetime('now')`.
 *
 * ⚠️ A real trap. SQLite emits `"2026-09-02 14:30:00"` — UTC, but with a space
 * instead of `T` and no zone marker. Hand that to `new Date()` and Hermes
 * reads it as *local* time, so every timestamp in the app is silently off by
 * your UTC offset — eight hours of "connected in the future" in Manila, and
 * nothing at all in London, which is why it survives review.
 *
 * Every column written with `datetime('now')` must come back through here.
 *
 * @returns {Date|null} null for empty or unparseable input
 */
export const parseSqliteDate = (value) => {
  if (!value) return null;
  const normalized = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)
    ? `${value.replace(" ", "T")}Z`
    : value;
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Coarse "how long ago", for list rows where the exact minute does not matter.
 *   -> "just now" · "4m ago" · "3h ago" · "yesterday" · "Jan 9"
 *
 * Accepts SQLite timestamps directly.
 */
export const formatRelativeTime = (value) => {
  const date = parseSqliteDate(value);
  if (!date) return null;

  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  // Clock skew, or a row written a moment ago — never render "in -2 minutes".
  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;

  return localizeDate(date);
};
