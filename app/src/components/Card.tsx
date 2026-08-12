import React from 'react';
import { Pressable, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  accessibilityLabel?: string;
  /** Use the alternate porcelain surface. */
  alt?: boolean;
}

export function Card({ children, style, onPress, accessibilityLabel, alt = false }: CardProps) {
  const { theme } = useTheme();
  const containerStyle: ViewStyle = {
    backgroundColor: alt ? theme.palette.surfaceAlt : theme.palette.surface,
    borderColor: theme.palette.border,
    borderRadius: theme.radii.sm,
    padding: theme.spacing.md,
  };

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={({ pressed }) => [styles.base, containerStyle, { opacity: pressed ? 0.9 : 1 }, style]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, containerStyle, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderWidth: StyleSheet.hairlineWidth,
  },
});
