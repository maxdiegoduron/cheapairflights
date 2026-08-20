import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Calendar } from "../src/components/Calendar";
import { ErrorBanner, PrimaryButton } from "../src/components/ui";
import {
  MAX_RANGE_DAYS,
  rangeLengthDays,
  setDateRange,
  useRouteSelection,
} from "../src/state/routeSelection";
import { useTheme } from "../src/theme/ThemeContext";

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export default function DatePickerScreen() {
  const { colors } = useTheme();
  const selection = useRouteSelection();

  const [start, setStart] = useState<string | null>(selection.startDate || null);
  const [end, setEnd] = useState<string | null>(selection.endDate || null);
  const [error, setError] = useState<string | null>(null);

  function onSelect(date: string) {
    setError(null);

    // First tap (or restarting) sets the start and clears the end; the next
    // tap closes the range.
    if (!start || end || date < start) {
      setStart(date);
      setEnd(null);
      return;
    }

    if (rangeLengthDays(start, date) > MAX_RANGE_DAYS) {
      setError(`Pick a range of ${MAX_RANGE_DAYS} days or fewer — that's ${rangeLengthDays(start, date)}.`);
      return;
    }

    setEnd(date);
  }

  function onDone() {
    if (!start) {
      setError("Pick your earliest date.");
      return;
    }
    // A single tapped day means a one-day search.
    setDateRange(start, end ?? start);
    router.back();
  }

  const summary = start
    ? end
      ? `${formatDate(start)} – ${formatDate(end)} · ${rangeLengthDays(start, end)} days`
      : `${formatDate(start)} — now pick the latest date`
    : "Pick your earliest date";

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.summary, { color: start && end ? colors.textPrimary : colors.textSecondary }]}>
        {summary}
      </Text>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Calendar startDate={start} endDate={end} onSelect={onSelect} />
      </View>

      {error ? (
        <View style={styles.section}>
          <ErrorBanner message={error} />
        </View>
      ) : null}

      <Text style={[styles.footnote, { color: colors.textTertiary }]}>
        We check every day in your range, so a wider range costs more of the free search quota.
      </Text>

      <View style={styles.section}>
        <PrimaryButton title="Done" onPress={onDone} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  summary: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 14,
  },
  card: {
    borderRadius: 12,
    padding: 10,
  },
  section: {
    marginTop: 18,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 14,
    marginHorizontal: 8,
    textAlign: "center",
  },
});
