import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Airport, searchAirports } from "../src/data/airports";
import { AirportField, setAirport } from "../src/state/routeSelection";
import { useTheme } from "../src/theme/ThemeContext";

export default function AirportPickerScreen() {
  const { colors } = useTheme();
  const { field } = useLocalSearchParams<{ field: AirportField }>();

  const [query, setQuery] = useState("");
  const results = useMemo(() => searchAirports(query), [query]);

  function onSelect(airport: Airport) {
    setAirport(field === "destination" ? "destination" : "origin", airport.code);
    router.back();
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.heading, { color: colors.textPrimary }]}>
        {field === "destination" ? "Flying to" : "Flying from"}
      </Text>

      <View style={[styles.searchWrap, { backgroundColor: colors.fill }]}>
        <Ionicons name="search" size={17} color={colors.textSecondary} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="City, airport, or code"
          placeholderTextColor={colors.textTertiary}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          style={[styles.searchInput, { color: colors.textPrimary }]}
        />
        {query ? (
          <Pressable onPress={() => setQuery("")} hitSlop={8} accessibilityLabel="Clear search">
            <Ionicons name="close-circle" size={17} color={colors.textTertiary} />
          </Pressable>
        ) : null}
      </View>

      {results.length === 0 ? (
        <View style={styles.empty}>
          <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No airports found</Text>
          <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>
            Try a city name like Paris, or a code like CDG.
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.code}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: colors.surface, opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <View style={styles.rowMain}>
                <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
                  {item.name}
                </Text>
                <Text style={[styles.meta, { color: colors.textSecondary }]} numberOfLines={1}>
                  ({item.code}) · {item.city}, {item.country}
                </Text>
              </View>
              <Text style={[styles.code, { color: colors.primary }]}>{item.code}</Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 22,
    fontWeight: "700",
    marginHorizontal: 16,
    marginTop: 14,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 8,
    paddingHorizontal: 10,
    height: 36,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 0,
  },
  list: {
    padding: 16,
    paddingTop: 8,
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
  },
  rowMain: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  meta: {
    fontSize: 13,
    marginTop: 2,
  },
  code: {
    fontSize: 15,
    fontWeight: "700",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyBody: {
    fontSize: 15,
    textAlign: "center",
  },
});
