import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { HeaderLogo } from "../src/components/ui";
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
          headerTitle: () => <HeaderLogo />,
          headerTitleAlign: "left",
          headerShadowVisible: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="results" />
        <Stack.Screen name="flight-detail" options={{ presentation: "modal" }} />
        <Stack.Screen name="airport-picker" options={{ presentation: "modal" }} />
        <Stack.Screen name="date-picker" options={{ presentation: "modal" }} />
        <Stack.Screen name="stay-picker" options={{ presentation: "modal" }} />
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
