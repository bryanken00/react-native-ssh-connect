import { useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useThemeColors } from "@/hooks/useTheme";
import { DAYS, isBetween, isSameDay } from "./dateUtils";

/**
 * One month's day grid, with range highlighting. Future dates are disabled.
 *
 * Presentational — the caller owns `startDate`/`endDate` and decides what a
 * tap means via `onSelectDate`.
 *
 * @param {number}   year
 * @param {number}   month        - 0-indexed, as in the Date constructor
 * @param {Date}     startDate
 * @param {Date}     endDate
 * @param {Function} onSelectDate - (date: Date) => void
 */
const CalendarMonth = ({ year, month, startDate, endDate, onSelectDate }) => {
  const colors = useThemeColors();

  // Leading nulls pad the grid so day 1 lands under the right weekday
  const days = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push(new Date(year, month, d));
    }
    return cells;
  }, [year, month]);

  const today = new Date();
  // A theme token, so the range strip stays correct in dark mode
  const rangeBg = colors.secondary;

  return (
    <View style={s.calendarGrid}>
      {/* Day headers */}
      {DAYS.map((day) => (
        <View key={day} style={s.dayHeader}>
          <Text style={[s.dayHeaderText, { color: colors.mutedForeground }]}>
            {day}
          </Text>
        </View>
      ))}

      {/* Day cells */}
      {days.map((date, idx) => {
        if (!date) {
          return <View key={`empty-${idx}`} style={s.dayCell} />;
        }

        const isStart = isSameDay(date, startDate);
        const isEnd = isSameDay(date, endDate);
        const isInRange = isBetween(date, startDate, endDate);
        const isToday = isSameDay(date, today);
        const isSelected = isStart || isEnd;
        const isFuture = date > today;
        const sameStartEnd =
          startDate && endDate && isSameDay(startDate, endDate);

        // Continuous strip behind the range, rounded at each end
        let cellBg = {};
        if (isInRange) {
          cellBg = { backgroundColor: rangeBg };
        } else if (isStart && endDate && !sameStartEnd) {
          cellBg = {
            backgroundColor: rangeBg,
            borderTopLeftRadius: 20,
            borderBottomLeftRadius: 20,
          };
        } else if (isEnd && startDate && !sameStartEnd) {
          cellBg = {
            backgroundColor: rangeBg,
            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
          };
        }

        return (
          <TouchableOpacity
            key={idx}
            style={[s.dayCell, cellBg]}
            onPress={() => !isFuture && onSelectDate(date)}
            disabled={isFuture}
            activeOpacity={0.6}
          >
            <View
              style={[
                s.dayInner,
                isSelected && {
                  backgroundColor: colors.primary,
                  borderRadius: 18,
                },
              ]}
            >
              <Text
                style={[
                  s.dayText,
                  { color: colors.foreground },
                  isSelected && { color: colors.primaryForeground, fontWeight: "800" },
                  isInRange &&
                    !isSelected && {
                      color: colors.secondaryForeground,
                      fontWeight: "600",
                    },
                  isToday &&
                    !isSelected &&
                    !isInRange && {
                      color: colors.primary,
                      fontWeight: "800",
                    },
                  isFuture && { opacity: 0.3 },
                ]}
              >
                {date.getDate()}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const s = StyleSheet.create({
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayHeader: {
    width: "14.28%",
    alignItems: "center",
    paddingVertical: 6,
  },
  dayHeaderText: {
    fontSize: 11,
    fontWeight: "700",
  },
  dayCell: {
    width: "14.28%",
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  dayInner: {
    width: 30,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 13,
    fontWeight: "500",
  },
});

export default CalendarMonth;
