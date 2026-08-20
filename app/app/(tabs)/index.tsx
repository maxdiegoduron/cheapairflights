import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { searchPrices } from "../../src/api/client";
import {
  ErrorBanner,
  GroupedCard,
  NavRow,
  PrimaryButton,
  SectionHeader,
  SegmentedControl,
} from "../../src/components/ui";
import { findAirport } from "../../src/data/airports";
import {
  checkedCount,
  combinationCount,
  DateMode,
  MAX_RANGE_DAYS,
  MAX_STAY_DAYS,
  MAX_WINDOW_DAYS,
  nightsBetween,
  rangeLengthDays,
  setDateMode,
  setTripType,
  swapAirports as swapSelection,
  TripType,
  useRouteSelection,
} from "../../src/state/routeSelection";
import { useTheme } from "../../src/theme/ThemeContext";

const IATA_CODE = /^[A-Za-z]{3}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const BACKGROUND_IMAGE_WIDTH = 4284;
const BACKGROUND_IMAGE_HEIGHT = 5712;
// Fraction of the crop's vertical slack to shift down by, so the crop centers
// on the face instead of the hairline. 0 = anchored to the very top, 1 = anchored
// to the very bottom.
const BACKGROUND_FOCAL_RATIO = 0.32;

function TopAnchoredBackground({ children }: { children: React.ReactNode }) {
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  function onLayout(event: LayoutChangeEvent) {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  }

  const scale = containerSize
    ? Math.max(
        containerSize.width / BACKGROUND_IMAGE_WIDTH,
        containerSize.height / BACKGROUND_IMAGE_HEIGHT,
      )
    : 0;
  const imageWidth = BACKGROUND_IMAGE_WIDTH * scale;
  const imageHeight = BACKGROUND_IMAGE_HEIGHT * scale;
  const verticalSlack = containerSize ? Math.max(imageHeight - containerSize.height, 0) : 0;

  return (
    <View style={{ flex: 1, overflow: "hidden" }} onLayout={onLayout}>
      {containerSize ? (
        <Image
          source={require("../../assets/SuperFly.png")}
          style={{
            position: "absolute",
            top: -(verticalSlack * BACKGROUND_FOCAL_RATIO),
            left: (containerSize.width - imageWidth) / 2,
            width: imageWidth,
            height: imageHeight,
          }}
        />
      ) : null}
      {children}
    </View>
  );
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(date + "T00:00:00Z"));
}

export default function SearchScreen() {
  const { colors } = useTheme();

  const selection = useRouteSelection();
  const { origin, destination, startDate, endDate, tripType, dateMode, minStayDays, maxStayDays } =
    selection;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isRoundTrip = tripType === "roundtrip";
  const isExact = isRoundTrip && dateMode === "exact";
  const isFlexible = isRoundTrip && dateMode === "flexible";
  const searchCount = checkedCount(selection);
  const totalCombinations = combinationCount(selection);
  const willSample = searchCount < totalCombinations;

  function airportLabel(code: string): string | undefined {
    if (!code) return undefined;
    const airport = findAirport(code);
    return airport ? `${airport.city} (${airport.code})` : code;
  }

  function validate(): string | null {
    if (!IATA_CODE.test(origin)) return "Choose the airport you're flying from.";
    if (!IATA_CODE.test(destination)) return "Choose the airport you're flying to.";
    if (origin.toUpperCase() === destination.toUpperCase()) return "Origin and destination can't be the same.";
    if (!DATE.test(startDate) || !DATE.test(endDate)) return "Choose your travel dates.";
    if (startDate > endDate) return "The earliest date must come before the latest date.";
    const windowDays = rangeLengthDays(startDate, endDate);

    if (isExact) {
      const nights = nightsBetween(startDate, endDate);
      if (nights < 1) return "Pick a return date after your departure date.";
      if (nights > MAX_STAY_DAYS) return `Trips can be up to ${MAX_STAY_DAYS} days.`;
    } else if (isFlexible) {
      if (windowDays > MAX_WINDOW_DAYS) {
        return `Choose a travel window of ${MAX_WINDOW_DAYS} days or fewer.`;
      }
    } else if (windowDays > MAX_RANGE_DAYS) {
      return `Choose a range of ${MAX_RANGE_DAYS} days or fewer.`;
    }

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
      // Exact dates are expressed to the API as a single-day window with a
      // fixed stay length, which yields exactly one priced trip.
      const nights = isExact ? nightsBetween(startDate, endDate) : 0;

      const response = await searchPrices({
        origin: origin.toUpperCase(),
        destination: destination.toUpperCase(),
        startDate,
        endDate: isExact ? startDate : endDate,
        ...(isExact
          ? { minStayDays: nights, maxStayDays: nights }
          : isFlexible
            ? { minStayDays, maxStayDays }
            : {}),
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
      <TopAnchoredBackground>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <SegmentedControl<TripType>
            options={[
              { value: "oneway", label: "One-way" },
              { value: "roundtrip", label: "Round trip" },
            ]}
            value={tripType}
            onChange={setTripType}
          />
        </View>

        {isRoundTrip ? (
          <View style={styles.section}>
            <Text style={[styles.question, { color: colors.textPrimary }]}>
              Do you know your exact dates?
            </Text>
            <SegmentedControl<DateMode>
              options={[
                { value: "exact", label: "Yes, I do" },
                { value: "flexible", label: "No, I'm flexible" },
              ]}
              value={dateMode}
              onChange={setDateMode}
            />
          </View>
        ) : null}

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
            <NavRow
              icon="calendar-outline"
              label={isExact ? "Dates" : isFlexible ? "Between" : "When"}
              value={
                startDate && endDate
                  ? isExact
                    ? `${formatDate(startDate)} → ${formatDate(endDate)}`
                    : `${formatDate(startDate)} – ${formatDate(endDate)}`
                  : undefined
              }
              placeholder="Select dates"
              onPress={() => router.push("/date-picker")}
            />
            {isFlexible ? (
              <NavRow
                icon="time-outline"
                label="Days away"
                value={
                  minStayDays === maxStayDays
                    ? `${minStayDays} days`
                    : `${minStayDays}–${maxStayDays} days`
                }
                placeholder="Select trip length"
                onPress={() => router.push("/stay-picker")}
              />
            ) : null}
          </GroupedCard>
          <Text style={[styles.footnote, { color: colors.textSecondary }]}>
            {!isRoundTrip
              ? `We check every day in the range, up to ${MAX_RANGE_DAYS} days, and show you the cheapest.`
              : isExact
                ? `Pricing this exact ${nightsBetween(startDate, endDate)}-day trip.`
                : willSample
                  ? `Your window is wide, so we'll sample ${searchCount} trips evenly across it to find the cheapest stretch.`
                  : `We price every departure date against every trip length — ${searchCount} searches — and show the cheapest combination.`}
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
      </TopAnchoredBackground>
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
  question: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 7,
    marginHorizontal: 16,
  },
});
