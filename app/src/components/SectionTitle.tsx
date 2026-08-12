import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SectionTitleProps {
  title: string;
  /** Small letter-spaced eyebrow above the serif title. */
  eyebrow?: string;
  action?: React.ReactNode;
}

export function SectionTitle({ title, eyebrow, action }: SectionTitleProps) {
  const { theme } = useTheme();
  return (
    <View style={[styles.row, { marginBottom: theme.spacing.md, marginTop: theme.spacing.lg }]}>
      <View style={styles.textCol}>
        {eyebrow ? (
          <Text style={[theme.typeScale.label, { color: theme.palette.accentDeep, marginBottom: theme.spacing.xs }]}>
            {eyebrow}
          </Text>
        ) : null}
        <Text accessibilityRole="header" style={[theme.typeScale.heading, { color: theme.palette.heading }]}>
          {title}
        </Text>
      </View>
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  textCol: {
    flexShrink: 1,
  },
});
