import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useThemeColors } from "@/hooks/useTheme";

import CalendarMonth from "./CalendarMonth";
import { MONTHS, isSameDay, toDateStr } from "./dateUtils";

// ── Main Component ────────────────────────────────────────────────────────────

const DateRangePicker = ({
  visible,
  onClose,
  onApply,
  initialFrom,
  initialTo,
}) => {
  const colors = useThemeColors();
  const now = new Date();

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  useEffect(() => {
    if (visible) {
      if (initialFrom) {
        const d = new Date(initialFrom);
        setStartDate(d);
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      } else {
        setStartDate(null);
        setViewYear(now.getFullYear());
        setViewMonth(now.getMonth());
      }
      setEndDate(initialTo ? new Date(initialTo) : null);
    }
  }, [visible]);

  const handleSelectDate = (date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } else {
      if (date < startDate) {
        setEndDate(startDate);
        setStartDate(date);
      } else if (isSameDay(date, startDate)) {
        setEndDate(date);
      } else {
        setEndDate(date);
      }
    }
  };

  const handleApply = () => {
    if (!startDate || !endDate) return;
    onApply(toDateStr(startDate), toDateStr(endDate) + " 23:59:59");
    onClose();
  };

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handlePreset = (daysBack) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - daysBack);
    setStartDate(start);
    setEndDate(end);
    setViewYear(end.getFullYear());
    setViewMonth(end.getMonth());
  };

  const canApply = !!(startDate && endDate);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Select Date Range
            </Text>
            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color={colors.mutedForeground} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Selected range display */}
          <View
            style={[
              styles.rangeDisplay,
              {
                backgroundColor: colors.muted,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.rangeDateBox}>
              <Text
                style={[
                  styles.rangeDateLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                FROM
              </Text>
              <Text
                style={[
                  styles.rangeDateValue,
                  {
                    color: startDate
                      ? colors.primary
                      : colors.mutedForeground + "70",
                  },
                ]}
              >
                {startDate ? toDateStr(startDate) : "Select start"}
              </Text>
            </View>
            <ArrowRight
              size={16}
              color={colors.mutedForeground + "99"}
              strokeWidth={2}
              style={{ marginHorizontal: 8 }}
            />
            <View style={styles.rangeDateBox}>
              <Text
                style={[
                  styles.rangeDateLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                TO
              </Text>
              <Text
                style={[
                  styles.rangeDateValue,
                  {
                    color: endDate
                      ? colors.primary
                      : colors.mutedForeground + "70",
                  },
                ]}
              >
                {endDate ? toDateStr(endDate) : "Select end"}
              </Text>
            </View>
          </View>

          {/* Quick presets */}
          <View style={styles.presetsRow}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: "center" }}
            >
              {[
                { label: "Today", days: 0 },
                { label: "7 days", days: 7 },
                { label: "14 days", days: 14 },
                { label: "30 days", days: 30 },
                { label: "90 days", days: 90 },
              ].map((preset) => (
                <TouchableOpacity
                  key={preset.label}
                  onPress={() => handlePreset(preset.days)}
                  style={[
                    styles.presetChip,
                    {
                      borderColor: colors.primary,
                      backgroundColor: colors.secondary + "55",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.presetChipText,
                      { color: colors.primary },
                    ]}
                  >
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity
              onPress={handlePrevMonth}
              style={[
                styles.navBtn,
                { backgroundColor: colors.secondary },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronLeft
                size={18}
                color={colors.primary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
            <Text
              style={[styles.monthTitle, { color: colors.foreground }]}
            >
              {MONTHS[viewMonth]} {viewYear}
            </Text>
            <TouchableOpacity
              onPress={handleNextMonth}
              style={[
                styles.navBtn,
                { backgroundColor: colors.secondary },
              ]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronRight
                size={18}
                color={colors.primary}
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <CalendarMonth
            year={viewYear}
            month={viewMonth}
            startDate={startDate}
            endDate={endDate}
            onSelectDate={handleSelectDate}
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClose}
              style={[
                styles.actionBtn,
                { borderColor: colors.border },
              ]}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  { color: colors.mutedForeground },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              disabled={!canApply}
              style={[
                styles.actionBtn,
                {
                  backgroundColor: canApply
                    ? colors.primary
                    : colors.muted,
                  borderColor: "transparent",
                  shadowColor: canApply ? colors.primary : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.28,
                  shadowRadius: 8,
                  elevation: canApply ? 4 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.actionBtnText,
                  {
                    color: canApply
                      ? colors.primaryForeground
                      : colors.mutedForeground,
                  },
                ]}
              >
                Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default DateRangePicker;

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    borderRadius: 28,
    padding: 22,
    width: "92%",
    maxWidth: 440,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  rangeDisplay: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  rangeDateBox: {
    flex: 1,
    alignItems: "center",
  },
  rangeDateLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  rangeDateValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  presetsRow: {
    height: 40,
    marginBottom: 12,
  },
  presetChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 8,
  },
  presetChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    height: 54,
    borderWidth: 1.5,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    fontSize: 15.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
