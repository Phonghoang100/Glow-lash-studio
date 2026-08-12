import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

type BadgeTone = 'accent' | 'blush' | 'muted' | 'success' | 'danger';

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
}

export function Badge({ label, tone = 'accent' }: BadgeProps) {
  const { theme } = useTheme();
  const { palette } = theme;

  const tones: Record<BadgeTone, { bg: string; fg: string }> = {
    accent: { bg: theme.isDark ? '#3A3222' : '#F3E9D6', fg: palette.accentDeep },
    blush: { bg: palette.blush, fg: theme.isDark ? palette.text : palette.heading },
    muted: { bg: palette.surfaceAlt, fg: palette.muted },
    success: { bg: theme.isDark ? '#2C3327' : '#EAF0E5', fg: palette.success },
    danger: { bg: theme.isDark ? '#3A2723' : '#F6E7E3', fg: palette.danger },
  };

  return (
    <View
      accessibilityLabel={label}
      style={[
        styles.base,
        {
          backgroundColor: tones[tone].bg,
          borderRadius: theme.radii.sm,
          paddingHorizontal: theme.spacing.sm,
        },
      ]}
    >
      <Text style={[theme.typeScale.label, { color: tones[tone].fg, fontSize: 10 }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
});
