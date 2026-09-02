/** Calendar vocabulary and date maths shared by the picker and its grid. */

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Date -> "YYYY-MM-DD" using local time.
 *
 * Deliberately not `toISOString().split("T")[0]`, which converts to UTC first
 * and so returns the wrong day either side of midnight.
 */
export const toDateStr = (date) => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

/** Same calendar day, ignoring time of day. */
export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
};

/** Strictly between start and end — endpoints excluded. */
export const isBetween = (date, start, end) => {
  if (!date || !start || !end) return false;
  const t = date.getTime();
  return t > start.getTime() && t < end.getTime();
};
