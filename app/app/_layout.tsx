import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "../src/supabase/AuthContext";
import { ThemeProvider, useTheme } from "../src/theme/ThemeContext";

function RootStack() {
  const { mode, colors } = useTheme();

  return (
    <>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.textPrimary },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="results" options={{ title: "Results" }} />
        <Stack.Screen
          name="flight-detail"
          options={{ presentation: "modal", title: "Flight details" }}
        />
        <Stack.Screen
          name="airport-picker"
          options={{ presentation: "modal", title: "Select airport" }}
        />
        <Stack.Screen
          name="date-picker"
          options={{ presentation: "modal", title: "Select dates" }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <RootStack />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
