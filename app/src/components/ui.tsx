import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { useTheme } from "../theme/ThemeContext";

export function SectionHeader({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.sectionHeader, { color: colors.textSecondary }]}>{title.toUpperCase()}</Text>
  );
}

/** iOS-style inset grouped card. Children are rendered as rows with hairline dividers. */
export function GroupedCard({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const items = React.Children.toArray(children);

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {items.map((child, i) => (
        <View key={i}>
          {child}
          {i < items.length - 1 ? (
            <View style={[styles.divider, { backgroundColor: colors.separator }]} />
          ) : null}
        </View>
      ))}
    </View>
  );
}

interface FieldRowProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}

export function FieldRow({ icon, label, ...inputProps }: FieldRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={20} color={colors.primary} style={styles.rowIcon} />
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textTertiary}
        style={[styles.rowInput, { color: colors.textSecondary }]}
        {...inputProps}
      />
    </View>
  );
}

/** iOS-style segmented control. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.segmentWrap, { backgroundColor: colors.fill }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.segment,
              selected && { backgroundColor: colors.surface },
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: colors.textPrimary, fontWeight: selected ? "600" : "400" },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Tappable row that opens another screen, iOS-style with a trailing chevron. */
export function NavRow({
  icon,
  label,
  value,
  placeholder,
  onPress,
  accessibilityLabel,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  placeholder: string;
  onPress: () => void;
  accessibilityLabel?: string;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? `${label}: ${value || placeholder}`}
      style={({ pressed }) => [styles.row, { opacity: pressed ? 0.5 : 1 }]}
    >
      <Ionicons name={icon} size={20} color={colors.primary} style={styles.rowIcon} />
      <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>{label}</Text>
      <Text
        style={[styles.rowValue, { color: value ? colors.textSecondary : colors.textTertiary }]}
        numberOfLines={1}
      >
        {value || placeholder}
      </Text>
      <Ionicons name="chevron-forward" size={17} color={colors.textTertiary} />
    </Pressable>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  disabled,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.primary, opacity: pressed || isDisabled ? 0.6 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.primaryText} />
      ) : (
        <Text style={[styles.buttonText, { color: colors.primaryText }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: colors.dangerBg }]}>
      <Ionicons name="alert-circle" size={18} color={colors.danger} />
      <Text style={[styles.bannerText, { color: colors.danger }]}>{message}</Text>
    </View>
  );
}

export function InfoBanner({ message }: { message: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.banner, { backgroundColor: colors.successBg }]}>
      <Ionicons name="checkmark-circle" size={18} color={colors.success} />
      <Text style={[styles.bannerText, { color: colors.success }]}>{message}</Text>
    </View>
  );
}

export function EmptyState({
  icon,
  title,
  body,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={52} color={colors.textTertiary} />
      <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.textSecondary }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeader: {
    fontSize: 13,
    fontWeight: "400",
    letterSpacing: 0.5,
    marginBottom: 7,
    marginLeft: 16,
  },
  card: {
    borderRadius: 10,
    overflow: "hidden",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 48,
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
  rowInput: {
    fontSize: 17,
    textAlign: "right",
    minWidth: 120,
    paddingVertical: 11,
  },
  rowValue: {
    fontSize: 17,
    textAlign: "right",
    flexShrink: 1,
    marginRight: 6,
  },
  segmentWrap: {
    flexDirection: "row",
    borderRadius: 9,
    padding: 2,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    borderRadius: 7,
  },
  segmentText: {
    fontSize: 15,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 17,
    fontWeight: "600",
  },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 10,
    padding: 12,
  },
  bannerText: {
    fontSize: 14,
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "600",
    marginTop: 6,
  },
  emptyBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 21,
  },
});
