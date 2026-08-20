import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState, ErrorBanner, SegmentedControl } from "../src/components/ui";
import { useAuth } from "../src/supabase/AuthContext";
import { deleteSavedRoute, saveRoute } from "../src/supabase/savedRoutes";
import { useTheme } from "../src/theme/ThemeContext";
import { FlightPriceResult, nightsBetween, PriceSearchResponse } from "../src/types/flight";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateStr + "T00:00:00Z"));
}

function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/** Unique per result row: one departure date can appear at several trip lengths. */
function resultKey(item: FlightPriceResult): string {
  return `${item.date}|${item.returnDate ?? ""}`;
}

type SortMode = "value" | "price" | "days";

/** Trip length in days; one-way results count as a single day. */
function tripDays(item: FlightPriceResult): number {
  return item.returnDate ? Math.max(1, nightsBetween(item.date, item.returnDate)) : 1;
}

function pricePerDay(item: FlightPriceResult): number {
  return item.price / tripDays(item);
}

function notify(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
  } else {
    Alert.alert(message);
  }
}

export default function ResultsScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { data } = useLocalSearchParams<{ data: string }>();

  // Maps a result's key to its saved_routes row id, so the bookmark can toggle
  // back off without a refetch. Keyed on departure + return because a round
  // trip search returns several trip lengths off the same departure date.
  const [savedIds, setSavedIds] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const response = useMemo<PriceSearchResponse | null>(() => {
    if (!data) return null;
    try {
      return JSON.parse(data) as PriceSearchResponse;
    } catch {
      return null;
    }
  }, [data]);

  // Round trips default to best value, which favours longer trips; a one-way
  // has no trip length to weigh, so plain price is the only sensible order.
  const [sortMode, setSortMode] = useState<SortMode>(
    response?.roundTrip ? "value" : "price"
  );

  const sorted = useMemo<FlightPriceResult[]>(() => {
    if (!response) return [];
    const items = [...response.results];

    switch (sortMode) {
      case "price":
        return items.sort((a, b) => a.price - b.price);
      case "days":
        // Longest trip first, then cheapest among equally long trips.
        return items.sort((a, b) => tripDays(b) - tripDays(a) || a.price - b.price);
      case "value":
      default:
        return items.sort((a, b) => pricePerDay(a) - pricePerDay(b) || a.price - b.price);
    }
  }, [response, sortMode]);

  async function onToggleSave(item: FlightPriceResult) {
    if (!user || !response) {
      notify("Sign in from the Account tab to save flights.");
      return;
    }

    setError(null);
    const key = resultKey(item);
    const existingId = savedIds[key];

    try {
      if (existingId) {
        setSavedIds((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        await deleteSavedRoute(existingId);
      } else {
        const saved = await saveRoute(user.id, {
          origin: response.origin,
          destination: response.destination,
          flight_date: item.date,
          return_date: item.returnDate,
          price: item.price,
          currency: item.currency,
          airline: item.airline,
        });
        setSavedIds((prev) => ({ ...prev, [key]: saved.id }));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't update your saved flights.");
    }
  }

  if (!response || sorted.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="airplane-outline"
          title="No prices found"
          body="Try a different route or a wider range of dates."
        />
      </View>
    );
  }

  // The top row is the winner under whichever sort is active, so the badge
  // names that criterion rather than always claiming "cheapest".
  const topKey = resultKey(sorted[0]);
  const topLabel =
    !response.roundTrip || sortMode === "price"
      ? "Cheapest"
      : sortMode === "days"
        ? "Longest"
        : "Best value";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.route, { color: colors.textPrimary }]}>
          {response.origin} → {response.destination}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {response.sampled
            ? `${sorted.length} trips · sampled from ${response.totalCombinations} across your window`
            : `${sorted.length} ${
                response.roundTrip ? "trips" : sorted.length === 1 ? "date" : "dates"
              }`}
        </Text>
      </View>

      {response.roundTrip ? (
        <View style={styles.sortWrap}>
          <SegmentedControl<SortMode>
            options={[
              { value: "value", label: "Best value" },
              { value: "price", label: "Lowest price" },
              { value: "days", label: "Most days" },
            ]}
            value={sortMode}
            onChange={setSortMode}
          />
        </View>
      ) : null}

      {error ? (
        <View style={styles.bannerWrap}>
          <ErrorBanner message={error} />
        </View>
      ) : null}

      <FlatList
        data={sorted}
        keyExtractor={resultKey}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const key = resultKey(item);
          const isCheapest = key === topKey;
          const isSaved = Boolean(savedIds[key]);

          return (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/flight-detail",
                  params: {
                    origin: response.origin,
                    destination: response.destination,
                    date: item.date,
                    returnDate: item.returnDate ?? "",
                    price: String(item.price),
                    currency: item.currency,
                    airline: item.airline ?? "",
                  },
                })
              }
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <View style={styles.rowMain}>
                <View style={styles.dateLine}>
                  <Text style={[styles.date, { color: colors.textPrimary }]}>
                    {item.returnDate
                      ? `${formatDate(item.date)} → ${formatDate(item.returnDate)}`
                      : formatDate(item.date)}
                  </Text>
                  {isCheapest ? (
                    <View style={[styles.badge, { backgroundColor: colors.successBg }]}>
                      <Text style={[styles.badgeText, { color: colors.success }]}>{topLabel}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={[styles.airline, { color: colors.textSecondary }]}>
                  {[
                    item.returnDate ? `${tripDays(item)} days` : null,
                    item.returnDate
                      ? `${formatPrice(Math.round(pricePerDay(item)), item.currency)}/day`
                      : null,
                    item.airline,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </Text>
              </View>

              <Text
                style={[
                  styles.price,
                  { color: isCheapest ? colors.success : colors.textPrimary },
                ]}
              >
                {formatPrice(item.price, item.currency)}
              </Text>

              <Pressable
                onPress={() => onToggleSave(item)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={isSaved ? "Remove from saved flights" : "Save this flight"}
                style={({ pressed }) => [styles.bookmark, { opacity: pressed ? 0.5 : 1 }]}
              >
                <Ionicons
                  name={isSaved ? "bookmark" : "bookmark-outline"}
                  size={20}
                  color={colors.primary}
                />
              </Pressable>

              <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  route: {
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: 0.35,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 2,
  },
  bannerWrap: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  sortWrap: {
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  list: {
    padding: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  rowMain: {
    flex: 1,
  },
  dateLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  date: {
    fontSize: 17,
    fontWeight: "600",
  },
  badge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  airline: {
    fontSize: 14,
    marginTop: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: "600",
  },
  bookmark: {
    paddingHorizontal: 2,
  },
});
