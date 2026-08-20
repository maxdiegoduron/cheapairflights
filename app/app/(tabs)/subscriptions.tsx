import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { EmptyState, ErrorBanner } from "../../src/components/ui";
import { useAuth } from "../../src/supabase/AuthContext";
import { deleteSavedRoute, listSavedRoutes, SavedRoute } from "../../src/supabase/savedRoutes";
import { useTheme } from "../../src/theme/ThemeContext";

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

export default function SubscriptionsScreen() {
  const { colors } = useTheme();
  const { user, configured } = useAuth();

  const [routes, setRoutes] = useState<SavedRoute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setRoutes([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setRoutes(await listSavedRoutes());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't load your saved flights.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onDelete(id: string) {
    const previous = routes;
    setRoutes((r) => r.filter((route) => route.id !== id));
    try {
      await deleteSavedRoute(id);
    } catch (e) {
      setRoutes(previous);
      setError(e instanceof Error ? e.message : "Couldn't remove that flight.");
    }
  }

  if (!configured) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ErrorBanner message="Accounts aren't set up yet. Add your Supabase URL and anon key to app/.env, then restart the app." />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="bookmark-outline"
          title="Sign in to save flights"
          body="Saved flights let you keep an eye on the fares you care about. Head to the Account tab to get started."
        />
      </View>
    );
  }

  if (loading && routes.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <EmptyState
          icon="bookmark-outline"
          title="No saved flights yet"
          body="Search for a route, then tap the bookmark on any result to save it here."
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? <ErrorBanner message={error} /> : null}
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        refreshing={loading}
        onRefresh={load}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              router.push({
                pathname: "/flight-detail",
                params: {
                  origin: item.origin,
                  destination: item.destination,
                  date: item.flight_date,
                  returnDate: item.return_date ?? "",
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
              <Text style={[styles.route, { color: colors.textPrimary }]}>
                {item.origin} → {item.destination}
              </Text>
              <Text style={[styles.meta, { color: colors.textSecondary }]}>
                {item.return_date
                  ? `${formatDate(item.flight_date)} → ${formatDate(item.return_date)}`
                  : formatDate(item.flight_date)}
                {item.airline ? ` · ${item.airline}` : ""}
              </Text>
            </View>

            <Text style={[styles.price, { color: colors.textPrimary }]}>
              {formatPrice(item.price, item.currency)}
            </Text>

            <Pressable
              onPress={() => onDelete(item.id)}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={`Remove saved flight ${item.origin} to ${item.destination}`}
              style={({ pressed }) => [styles.deleteButton, { opacity: pressed ? 0.5 : 1 }]}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
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
    gap: 12,
  },
  rowMain: {
    flex: 1,
  },
  route: {
    fontSize: 17,
    fontWeight: "600",
  },
  meta: {
    fontSize: 14,
    marginTop: 2,
  },
  price: {
    fontSize: 17,
    fontWeight: "600",
  },
  deleteButton: {
    paddingLeft: 4,
  },
});
