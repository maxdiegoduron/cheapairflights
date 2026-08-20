import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Linking, ScrollView, StyleSheet, Text, View } from "react-native";
import { GroupedCard, PrimaryButton, SectionHeader } from "../src/components/ui";
import { useTheme } from "../src/theme/ThemeContext";
import { googleFlightsUrl, nightsBetween } from "../src/types/flight";

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateStr + "T00:00:00Z"));
}

function DetailRow({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} style={styles.rowIcon} />
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: colors.textSecondary }]}>{value}</Text>
    </View>
  );
}

export default function FlightDetailScreen() {
  const { colors } = useTheme();
  const { origin, destination, date, returnDate, price, currency, airline } = useLocalSearchParams<{
    origin: string;
    destination: string;
    date: string;
    returnDate?: string;
    price: string;
    currency: string;
    airline: string;
  }>();

  const isRoundTrip = Boolean(returnDate);

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
    maximumFractionDigits: 0,
  }).format(Number(price));

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.hero}>
        <Text style={[styles.route, { color: colors.textPrimary }]}>
          {origin} → {destination}
        </Text>
        <Text style={[styles.price, { color: colors.primary }]}>{formattedPrice}</Text>
      </View>

      <View style={styles.section}>
        <SectionHeader title={isRoundTrip ? "Round trip" : "One-way"} />
        <GroupedCard>
          <DetailRow
            icon="airplane"
            label={isRoundTrip ? "Depart" : "Date"}
            value={formatDate(date)}
          />
          {isRoundTrip ? (
            <DetailRow icon="airplane-outline" label="Return" value={formatDate(returnDate!)} />
          ) : null}
          {isRoundTrip ? (
            <DetailRow
              icon="time-outline"
              label="Days away"
              value={`${nightsBetween(date, returnDate!)} days`}
            />
          ) : null}
          <DetailRow icon="business" label="Airline" value={airline || "Not listed"} />
          <DetailRow icon="pricetag" label="Price" value={formattedPrice} />
        </GroupedCard>
      </View>

      <View style={styles.section}>
        <PrimaryButton
          title="View on Google Flights"
          onPress={() =>
            Linking.openURL(googleFlightsUrl(origin, destination, date, returnDate || null))
          }
        />
        <Text style={[styles.footnote, { color: colors.textTertiary }]}>
          Opens this route and date on Google Flights, where you can book with the airline.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  hero: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 6,
  },
  route: {
    fontSize: 26,
    fontWeight: "700",
  },
  price: {
    fontSize: 40,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  section: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    minHeight: 44,
  },
  rowIcon: {
    width: 28,
  },
  rowLabel: {
    fontSize: 17,
    flex: 1,
  },
  rowValue: {
    fontSize: 17,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 10,
    marginHorizontal: 16,
    textAlign: "center",
  },
});
