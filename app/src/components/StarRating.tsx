import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';

interface StarRatingProps {
  rating: number;
  /** When provided the rating becomes editable. */
  onChange?: (rating: number) => void;
  size?: number;
}

export function StarRating({ rating, onChange, size = 18 }: StarRatingProps) {
  const { theme } = useTheme();
  const stars = [1, 2, 3, 4, 5];

  return (
    <View
      style={styles.row}
      accessibilityRole={onChange ? 'adjustable' : 'text'}
      accessibilityLabel={`${rating} out of 5 stars`}
    >
      {stars.map((star) => {
        const filled = star <= Math.round(rating);
        const iconName = filled ? 'star' : 'star-outline';
        if (onChange) {
          return (
            <Pressable
              key={star}
              accessibilityRole="button"
              accessibilityLabel={`Rate ${star} star${star === 1 ? '' : 's'}`}
              onPress={() => onChange(star)}
              hitSlop={6}
              style={{ marginRight: theme.spacing.xs }}
            >
              <Ionicons name={iconName} size={size} color={theme.palette.accent} />
            </Pressable>
          );
        }
        return (
          <Ionicons
            key={star}
            name={iconName}
            size={size}
            color={theme.palette.accent}
            style={{ marginRight: theme.spacing.xs }}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
