import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { toISODate } from "../state/routeSelection";
import { useTheme } from "../theme/ThemeContext";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS_AHEAD = 11;

interface CalendarProps {
  startDate: string | null;
  endDate: string | null;
  onSelect: (date: string) => void;
  /** Dates before this are not selectable. Defaults to today. */
  minDate?: string;
}

function startOfMonth(year: number, month: number): Date {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/**
 * Month-grid calendar with range selection. Built in-house rather than pulled
 * from a library so it renders identically on web and native and inherits the
 * app's own theme tokens.
 */
export function Calendar({ startDate, endDate, onSelect, minDate }: CalendarProps) {
  const { colors } = useTheme();
  const today = useMemo(() => toISODate(new Date()), []);
  const floor = minDate ?? today;

  const initial = startDate ? new Date(startDate + "T00:00:00") : new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(initial.getFullYear(), initial.getMonth()));

  const maxCursor = useMemo(() => {
    const d = new Date();
    return startOfMonth(d.getFullYear(), d.getMonth() + MONTHS_AHEAD);
  }, []);
  const minCursor = useMemo(() => {
    const d = new Date(floor + "T00:00:00");
    return startOfMonth(d.getFullYear(), d.getMonth());
  }, [floor]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    const leading = startOfMonth(year, month).getDay();
    const total = daysInMonth(year, month);
    const out: (string | null)[] = Array(leading).fill(null);
    for (let day = 1; day <= total; day++) {
      out.push(toISODate(new Date(year, month, day)));
    }
    return out;
  }, [year, month]);

  const monthLabel = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(
    cursor
  );

  const canGoBack = cursor > minCursor;
  const canGoForward = cursor < maxCursor;

  function shiftMonth(delta: number) {
    setCursor((c) => startOfMonth(c.getFullYear(), c.getMonth() + delta));
  }

  return (
    <View>
      <View style={styles.header}>
        <Pressable
          onPress={() => shiftMonth(-1)}
          disabled={!canGoBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
          style={({ pressed }) => [{ opacity: !canGoBack ? 0.25 : pressed ? 0.5 : 1 }]}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primary} />
        </Pressable>

        <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>{monthLabel}</Text>

        <Pressable
          onPress={() => shiftMonth(1)}
          disabled={!canGoForward}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Next month"
          style={({ pressed }) => [{ opacity: !canGoForward ? 0.25 : pressed ? 0.5 : 1 }]}
        >
          <Ionicons name="chevron-forward" size={22} color={colors.primary} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} style={[styles.weekday, { color: colors.textSecondary }]}>
            {d}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((date, i) => {
          if (!date) return <View key={`pad-${i}`} style={styles.cell} />;

          const disabled = date < floor;
          const isStart = date === startDate;
          const isEnd = date === endDate;
          const inRange =
            !!startDate && !!endDate && date > startDate && date < endDate;
          const selected = isStart || isEnd;

          return (
            <Pressable
              key={date}
              onPress={() => onSelect(date)}
              disabled={disabled}
              accessibilityRole="button"
              accessibilityLabel={date}
              accessibilityState={{ selected, disabled }}
              style={[styles.cell, inRange && { backgroundColor: colors.successBg }]}
            >
              <View
                style={[
                  styles.day,
                  selected && { backgroundColor: colors.primary },
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    {
                      color: disabled
                        ? colors.textTertiary
                        : selected
                          ? colors.primaryText
                          : colors.textPrimary,
                      fontWeight: selected || date === today ? "700" : "400",
                    },
                  ]}
                >
                  {Number(date.slice(8, 10))}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  monthLabel: {
    fontSize: 17,
    fontWeight: "600",
  },
  weekRow: {
    flexDirection: "row",
    paddingBottom: 6,
  },
  weekday: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  dayText: {
    fontSize: 16,
  },
});
