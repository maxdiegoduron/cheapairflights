import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import {
  ErrorBanner,
  FieldRow,
  GroupedCard,
  InfoBanner,
  PrimaryButton,
  SectionHeader,
} from "../../src/components/ui";
import { useAuth } from "../../src/supabase/AuthContext";
import { useTheme } from "../../src/theme/ThemeContext";

export default function AccountScreen() {
  const { colors } = useTheme();
  const { user, configured, signIn, signUp, signOut } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setInfo(null);

    if (!email.includes("@")) {
      setError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { needsEmailConfirmation } = await signUp(email, password);
        if (needsEmailConfirmation) {
          setInfo("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        await signIn(email, password);
      }
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function onSignOut() {
    setError(null);
    setInfo(null);
    try {
      await signOut();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't sign out. Please try again.");
    }
  }

  if (!configured) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <ErrorBanner message="Accounts aren't set up yet. Add your Supabase URL and anon key to app/.env, then restart the app." />
      </ScrollView>
    );
  }

  if (user) {
    return (
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
      >
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: colors.fill }]}>
            <Ionicons name="person" size={36} color={colors.textSecondary} />
          </View>
          <Text style={[styles.email, { color: colors.textPrimary }]}>{user.email}</Text>
        </View>

        <View style={styles.section}>
          <PrimaryButton title="Sign out" onPress={onSignOut} />
        </View>

        {error ? <ErrorBanner message={error} /> : null}
      </ScrollView>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        style={{ backgroundColor: colors.background }}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.intro, { color: colors.textSecondary }]}>
          Create an account to save flights and find them again later.
        </Text>

        <View style={styles.section}>
          <SectionHeader title={mode === "signup" ? "Create account" : "Sign in"} />
          <GroupedCard>
            <FieldRow
              icon="mail-outline"
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />
            <FieldRow
              icon="lock-closed-outline"
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              autoCapitalize="none"
              secureTextEntry
            />
          </GroupedCard>
        </View>

        {info ? (
          <View style={styles.section}>
            <InfoBanner message={info} />
          </View>
        ) : null}

        {error ? (
          <View style={styles.section}>
            <ErrorBanner message={error} />
          </View>
        ) : null}

        <View style={styles.section}>
          <PrimaryButton
            title={mode === "signup" ? "Create account" : "Sign in"}
            onPress={onSubmit}
            loading={loading}
          />
        </View>

        <Pressable
          onPress={() => {
            setMode(mode === "signup" ? "signin" : "signup");
            setError(null);
            setInfo(null);
          }}
          style={({ pressed }) => [styles.switchMode, { opacity: pressed ? 0.5 : 1 }]}
        >
          <Text style={[styles.switchModeText, { color: colors.primary }]}>
            {mode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
          </Text>
        </Pressable>
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
    marginBottom: 20,
  },
  intro: {
    fontSize: 15,
    lineHeight: 21,
    marginBottom: 20,
    marginHorizontal: 16,
  },
  avatarWrap: {
    alignItems: "center",
    gap: 12,
    paddingVertical: 24,
    marginBottom: 12,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  email: {
    fontSize: 18,
    fontWeight: "600",
  },
  switchMode: {
    alignItems: "center",
    paddingVertical: 8,
  },
  switchModeText: {
    fontSize: 15,
  },
});
