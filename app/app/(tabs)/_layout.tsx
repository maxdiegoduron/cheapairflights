import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme/ThemeContext";

function ThemeToggleButton() {
  const { mode, colors, toggle } = useTheme();

  return (
    <Pressable
      onPress={toggle}
      hitSlop={10}
      style={({ pressed }) => [styles.toggle, { opacity: pressed ? 0.5 : 1 }]}
      accessibilityRole="button"
      accessibilityLabel={mode === "dark" ? "Switch to light mode" : "Switch to dark mode"}
    >
      <Ionicons name={mode === "dark" ? "sunny" : "moon"} size={22} color={colors.primary} />
    </Pressable>
  );
}

export default function TabsLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.separator,
          height: 52 + insets.bottom,
          paddingBottom: insets.bottom,
        },
        tabBarLabelStyle: { fontSize: 10, marginBottom: 4 },
        tabBarIconStyle: { marginTop: 2 },
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.textPrimary, fontSize: 17, fontWeight: "600" },
        headerShadowVisible: false,
        headerRight: () => <ThemeToggleButton />,
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Search",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: "Saved",
          tabBarIcon: ({ color, size }) => <Ionicons name="bookmark" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          tabBarIcon: ({ color, size }) => <Ionicons name="person" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: "Help",
          tabBarIcon: ({ color, size }) => <Ionicons name="help-circle" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  toggle: {
    marginRight: 16,
  },
});
