import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface AvatarProps {
  name: string;
  uri?: string;
  size?: number;
}

/** Circular avatar — remote image with initials fallback. */
export function Avatar({ name, uri, size = 48 }: AvatarProps) {
  const { theme } = useTheme();
  const initials = name
    .split(' ')
    .map((part) => part.charAt(0))
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return (
      <Image
        accessibilityRole="image"
        accessibilityLabel={`Portrait of ${name}`}
        source={{ uri }}
        style={[dimension, { backgroundColor: theme.palette.surfaceAlt }]}
      />
    );
  }

  return (
    <View
      accessibilityRole="image"
      accessibilityLabel={`Initials for ${name}`}
      style={[styles.fallback, dimension, { backgroundColor: theme.palette.blush }]}
    >
      <Text
        style={{
          fontFamily: theme.fonts.serif,
          fontSize: size * 0.38,
          color: theme.isDark ? theme.palette.text : theme.palette.heading,
        }}
      >
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
