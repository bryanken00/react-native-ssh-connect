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
