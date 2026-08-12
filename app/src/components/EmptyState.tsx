import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
}

export function EmptyState({ icon = 'sparkles-outline', title, message, actionTitle, onAction }: EmptyStateProps) {
  const { theme } = useTheme();
  const { palette, spacing, typeScale } = theme;

  return (
    <View style={[styles.container, { padding: spacing.xl }]}>
      <Ionicons name={icon} size={36} color={palette.accent} />
      <Text
        accessibilityRole="header"
        style={[typeScale.heading, { color: palette.heading, marginTop: spacing.md, textAlign: 'center' }]}
      >
        {title}
      </Text>
      <Text style={[typeScale.body, { color: palette.muted, marginTop: spacing.sm, textAlign: 'center' }]}>
        {message}
      </Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} onPress={onAction} style={{ marginTop: spacing.lg, alignSelf: 'center' }} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
