import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Ionicons name shown on the left. */
  icon?: keyof typeof Ionicons.glyphMap;
  /** Right-aligned detail text (e.g. a price). */
  detail?: string;
  onPress?: () => void;
  /** Custom right element; overrides chevron/detail. */
  right?: React.ReactNode;
  showChevron?: boolean;
}

export function ListRow({ title, subtitle, icon, detail, onPress, right, showChevron }: ListRowProps) {
  const { theme } = useTheme();
  const { palette, spacing, typeScale } = theme;

  const content = (
    <View style={[styles.row, { paddingVertical: spacing.md, borderBottomColor: palette.border }]}>
      {icon ? (
        <Ionicons
          name={icon}
          size={20}
          color={palette.accentDeep}
          style={{ marginRight: spacing.md }}
        />
      ) : null}
      <View style={styles.textCol}>
        <Text style={[typeScale.body, { color: palette.heading, fontWeight: '500' }]}>{title}</Text>
        {subtitle ? (
          <Text style={[typeScale.small, { color: palette.muted, marginTop: 2 }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? (
        right
      ) : (
        <View style={styles.rightCol}>
          {detail ? (
            <Text style={[typeScale.body, { color: palette.text, fontFamily: theme.fonts.serif }]}>{detail}</Text>
          ) : null}
          {(showChevron ?? Boolean(onPress)) ? (
            <Ionicons name="chevron-forward" size={16} color={palette.muted} style={{ marginLeft: spacing.sm }} />
          ) : null}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        onPress={onPress}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  textCol: {
    flex: 1,
  },
  rightCol: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
