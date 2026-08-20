import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton, SectionHeader } from "../src/components/ui";
import {
  MAX_COMBINATIONS,
  rangeLengthDays,
  setStayRange,
  useRouteSelection,
} from "../src/state/routeSelection";
import { useTheme } from "../src/theme/ThemeContext";

const MIN_NIGHTS = 1;
const MAX_NIGHTS = 30;

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.stepperRow, { backgroundColor: colors.surface }]}>
      <Text style={[styles.stepperLabel, { color: colors.textPrimary }]}>{label}</Text>

      <View style={styles.stepperControls}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Decrease ${label}`}
          style={({ pressed }) => [
            styles.stepperButton,
            { backgroundColor: colors.fill, opacity: value <= min ? 0.35 : pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="remove" size={20} color={colors.primary} />
        </Pressable>

        <Text style={[styles.stepperValue, { color: colors.textPrimary }]}>{value}</Text>

        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={`Increase ${label}`}
          style={({ pressed }) => [
            styles.stepperButton,
            { backgroundColor: colors.fill, opacity: value >= max ? 0.35 : pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons name="add" size={20} color={colors.primary} />
        </Pressable>
      </View>
    </View>
  );
}

export default function StayPickerScreen() {
  const { colors } = useTheme();
  const selection = useRouteSelection();

  const [min, setMin] = useState(selection.minStayDays);
  const [max, setMax] = useState(selection.maxStayDays);

  const departureDays = rangeLengthDays(selection.startDate, selection.endDate);
  const stayCount = max - min + 1;
  const combinations = departureDays * stayCount;

  // Mirrors the backend's sampling budget so the number shown here is what
  // the search will actually cost.
  const dateBudget = Math.max(1, Math.floor(MAX_COMBINATIONS / stayCount));
  const checkedDates = Math.min(departureDays, dateBudget);
  const checked = checkedDates * stayCount;
  const sampled = checked < combinations;

  function updateMin(v: number) {
    setMin(v);
    if (v > max) setMax(v);
  }

  function updateMax(v: number) {
    setMax(v);
    if (v < min) setMin(v);
  }

  function onDone() {
    setStayRange(min, max);
    router.back();
  }

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        How long are you staying? We'll price every combination of departure date and trip length,
        then show you the cheapest.
      </Text>

      <View style={styles.section}>
        <SectionHeader title="Days away" />
        <View style={styles.card}>
          <Stepper label="At least" value={min} onChange={updateMin} min={MIN_NIGHTS} max={MAX_NIGHTS} />
          <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          <Stepper label="At most" value={max} onChange={updateMax} min={MIN_NIGHTS} max={MAX_NIGHTS} />
        </View>
      </View>

      <View style={[styles.costCard, { backgroundColor: colors.fill }]}>
        <Text style={[styles.costValue, { color: colors.textPrimary }]}>{checked} searches</Text>
        <Text style={[styles.costNote, { color: colors.textSecondary }]}>
          {sampled
            ? `Sampling ${checkedDates} of ${departureDays} departure dates, spread evenly across your window × ${stayCount} trip ${
                stayCount === 1 ? "length" : "lengths"
              }`
            : `${departureDays} departure ${departureDays === 1 ? "date" : "dates"} × ${stayCount} trip ${
                stayCount === 1 ? "length" : "lengths"
              }`}
        </Text>
      </View>

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
  intro: {
    fontSize: 15,
    lineHeight: 21,
    marginHorizontal: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  stepperLabel: {
    fontSize: 17,
  },
  stepperControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 17,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  costCard: {
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  costValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  costNote: {
    fontSize: 13,
    marginTop: 3,
    textAlign: "center",
  },
});
