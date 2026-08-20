import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../src/theme/ThemeContext";

const SECTIONS: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  steps: string[];
}[] = [
  {
    icon: "search",
    title: "Search one-way",
    steps: [
      "Tap From and To to pick your airports. Search by city, airport name, or code — Paris, Heathrow, JFK.",
      "Tap When to open the calendar. Tap your earliest date, then your latest — up to 10 days apart.",
      "Tap Search flights. We check every day in that range and sort the results cheapest first.",
    ],
  },
  {
    icon: "swap-horizontal",
    title: "Search round trip",
    steps: [
      "Switch the toggle at the top from One-way to Round trip.",
      "Pick the range of dates you could leave, then tap Days away to set how long you're staying — a range like 5 to 7 days works well.",
      "We price every departure date against every trip length and show the cheapest combination, so you can see whether leaving a day earlier or staying a day longer saves money.",
    ],
  },
  {
    icon: "airplane",
    title: "See flight details",
    steps: [
      "Tap any result to see the airline, the exact dates, and how long the trip is.",
      "Tap View on Google Flights to open that route and date, where you can book it.",
    ],
  },
  {
    icon: "bookmark",
    title: "Save flights",
    steps: [
      "Tap the bookmark on a result to save it to the Saved tab.",
      "Open the Saved tab any time to see the fares you're watching.",
      "Tap the trash icon on a saved flight to remove it.",
    ],
  },
  {
    icon: "person",
    title: "Your account",
    steps: [
      "Create an account from the Account tab using your email and a password.",
      "Saving flights requires an account, so they're there when you come back.",
      "Searching works whether you're signed in or not.",
    ],
  },
  {
    icon: "moon",
    title: "Dark mode",
    steps: [
      "Tap the moon or sun in the top right to switch between light and dark.",
      "The app follows your device's appearance setting until you choose one yourself.",
    ],
  },
];

export default function HelpScreen() {
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={[styles.intro, { color: colors.textSecondary }]}>
        Cheaper Flights compares fares across a range of dates so you can see which day is cheapest
        to fly — one-way, or round trip across different trip lengths.
      </Text>

      {SECTIONS.map((section) => (
        <View key={section.title} style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.cardHeader}>
            <Ionicons name={section.icon} size={20} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{section.title}</Text>
          </View>

          {section.steps.map((step, i) => (
            <View key={i} style={styles.step}>
              <Text style={[styles.stepNumber, { color: colors.textTertiary }]}>{i + 1}</Text>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>{step}</Text>
            </View>
          ))}
        </View>
      ))}

      <Text style={[styles.footnote, { color: colors.textTertiary }]}>
        Prices come from Google Flights and are a starting point, not a guarantee. Always confirm the
        fare with the airline before booking.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  intro: {
    fontSize: 15,
    lineHeight: 21,
    marginHorizontal: 16,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  step: {
    flexDirection: "row",
    gap: 10,
  },
  stepNumber: {
    fontSize: 15,
    fontWeight: "600",
    minWidth: 16,
  },
  stepText: {
    fontSize: 15,
    lineHeight: 21,
    flex: 1,
  },
  footnote: {
    fontSize: 13,
    lineHeight: 18,
    marginHorizontal: 16,
    marginTop: 4,
  },
});
