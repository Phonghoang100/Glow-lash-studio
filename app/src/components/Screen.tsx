import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeContext';

interface ScreenProps {
  children: React.ReactNode;
  /** When true, wraps content in a ScrollView. */
  scroll?: boolean;
  /** Extra padding at the bottom of scroll content (e.g. above tab bar). */
  contentStyle?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
}

/** Safe-area wrapper with the themed page background. */
export function Screen({ children, scroll = false, contentStyle, edges = ['top', 'left', 'right'] }: ScreenProps) {
  const { theme } = useTheme();
  const base = [styles.flex, { backgroundColor: theme.palette.background }];

  if (scroll) {
    return (
      <SafeAreaView style={base} edges={edges}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[{ padding: theme.spacing.lg, paddingBottom: theme.spacing.xxl }, contentStyle]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={base} edges={edges}>
      <View style={[styles.flex, { padding: theme.spacing.lg }, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
