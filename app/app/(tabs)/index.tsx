import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { searchPrices } from "../../src/api/client";
import {
  ErrorBanner,
  FieldRow,
  GroupedCard,
  NavRow,
  PrimaryButton,
  SectionHeader,
} from "../../src/components/ui";
import { findAirport } from "../../src/data/airports";
import { swapAirports as swapSelection, useRouteSelection } from "../../src/state/routeSelection";
import { useTheme } from "../../src/theme/ThemeContext";

const IATA_CODE = /^[A-Za-z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 10;
const DEFAULT_RANGE_DAYS = 7;

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function defaultDates(): { start: string; end: string } {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  const end = new Date(start);
  end.setDate(end.getDate() + DEFAULT_RANGE_DAYS - 1);
  return { start: toISODate(start), end: toISODate(end) };
}

export default function SearchScreen() {
  const { colors } = useTheme();
  const defaults = defaultDates();

  const { origin, destination } = useRouteSelection();
  const [startDate, setStartDate] = useState(defaults.start);
  const [endDate, setEndDate] = useState(defaults.end);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function airportLabel(code: string): string | undefined {
    if (!code) return undefined;
    const airport = findAirport(code);
    return airport ? `${airport.city} (${airport.code})` : code;
  }

  function validate(): string | null {
    if (!IATA_CODE.test(origin)) return "Choose the airport you're flying from.";
    if (!IATA_CODE.test(destination)) return "Choose the airport you're flying to.";
    if (origin.toUpperCase() === destination.toUpperCase()) return "Origin and destination can't be the same.";
    if (!DATE.test(startDate) || !DATE.test(endDate)) return "Dates must be in YYYY-MM-DD format.";
    if (startDate > endDate) return "The earliest date must come before the latest date.";

    const days =
      Math.round(
        (new Date(endDate + "T00:00:00Z").getTime() - new Date(startDate + "T00:00:00Z").getTime()) /
          (24 * 60 * 60 * 1000)
      ) + 1;
    if (days > MAX_RANGE_DAYS) return `Choose a range of ${MAX_RANGE_DAYS} days or fewer.`;

    return null;
  }

  async function onSearch() {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const response = await searchPrices({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        startDate,
        endDate,
      });
      router.push({ pathname: "/results", params: { data: JSON.stringify(response) } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <SectionHeader title="Route" />
          <GroupedCard>
            <NavRow
              icon="airplane-outline"
              label="From"
              value={airportLabel(origin)}
              placeholder="Select airport"
              onPress={() =>
                router.push({ pathname: "/airport-picker", params: { field: "origin" } })
              }
            />
            <NavRow
              icon="airplane"
              label="To"
              value={airportLabel(destination)}
              placeholder="Select airport"
              onPress={() =>
                router.push({ pathname: "/airport-picker", params: { field: "destination" } })
              }
            />
          </GroupedCard>

          <Pressable
            onPress={swapSelection}
            accessibilityRole="button"
            accessibilityLabel="Swap origin and destination"
            style={({ pressed }) => [styles.swapRow, { opacity: pressed ? 0.5 : 1 }]}
          >
            <Ionicons name="swap-vertical" size={16} color={colors.primary} />
            <Text style={[styles.swapText, { color: colors.primary }]}>Swap airports</Text>
          </Pressable>
        </View>

        <View style={styles.section}>
          <SectionHeader title="Dates" />
          <GroupedCard>
            <FieldRow
              icon="calendar-outline"
              label="Earliest"
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
            />
            <FieldRow
              icon="calendar"
              label="Latest"
              value={endDate}
              onChangeText={setEndDate}
              placeholder="YYYY-MM-DD"
            />
          </GroupedCard>
          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            We check every day in the range, up to {MAX_RANGE_DAYS} days, and show you the cheapest.
          </Text>
        </View>

        {error ? (
          <View style={styles.section}>
            <ErrorBanner message={error} />
          </View>
        ) : null}

        <View style={styles.section}>
          <PrimaryButton title="Search flights" onPress={onSearch} loading={loading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  swapRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    marginLeft: 16,
  },
  swapText: {
    fontSize: 15,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 7,
    marginHorizontal: 16,
  },
});
