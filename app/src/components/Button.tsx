import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  accessibilityHint?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  accessibilityHint,
}: ButtonProps) {
  const { theme } = useTheme();
  const { palette, radii, spacing, typeScale } = theme;

  const backgrounds: Record<ButtonVariant, string> = {
    primary: palette.accent,
    secondary: palette.surfaceAlt,
    ghost: 'transparent',
    danger: 'transparent',
  };
  const textColors: Record<ButtonVariant, string> = {
    primary: palette.onAccent,
    secondary: palette.heading,
    ghost: palette.accentDeep,
    danger: palette.danger,
  };
  const borderColors: Record<ButtonVariant, string> = {
    primary: palette.accent,
    secondary: palette.border,
    ghost: 'transparent',
    danger: palette.danger,
  };

  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isInactive, busy: loading }}
      disabled={isInactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: backgrounds[variant],
          borderColor: borderColors[variant],
          borderRadius: radii.sm,
          paddingVertical: spacing.md - 2,
          paddingHorizontal: spacing.lg,
          opacity: isInactive ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <Text
          style={[
            typeScale.label,
            { color: textColors[variant], fontSize: 12, letterSpacing: 1.8 },
          ]}
        >
          {title}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    minHeight: 48,
  },
});
