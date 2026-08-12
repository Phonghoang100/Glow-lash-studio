import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { useTheme } from '../../src/theme/ThemeContext';
import { Service } from '../../src/types';

export default function ServiceDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, spacing, typeScale, fonts } = theme;

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (!id) {
      setLoading(false);
      return undefined;
    }
    api
      .getService(id)
      .then((result) => {
        if (!cancelled) {
          setService(result);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setService(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  if (!service) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Service not found"
          message="Browse the full menu from the Book tab."
          actionTitle="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll edges={['left', 'right']}>
      <Text accessibilityRole="header" style={{ fontFamily: fonts.serif, fontSize: 32, color: palette.heading }}>
        {service.name}
      </Text>
      <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: palette.accentDeep, marginTop: spacing.xs }}>
        ${service.price}
        {service.fillPrice ? (
          <Text style={[typeScale.small, { color: palette.muted }]}>  · fills ${service.fillPrice}</Text>
        ) : null}
      </Text>

      <Text style={[typeScale.body, { color: palette.text, marginTop: spacing.lg }]}>{service.description}</Text>

      <SectionTitle eyebrow="At a glance" title="The details" />
      <Card>
        <ListRow
          icon="time-outline"
          title="Duration"
          detail={service.durationMinutes > 0 ? `${service.durationMinutes} min` : 'Retail item'}
          showChevron={false}
        />
        <ListRow icon="hourglass-outline" title="Longevity" detail={service.longevity} showChevron={false} />
        {service.fillPrice ? (
          <ListRow
            icon="refresh-outline"
            title="Fill (2–3 weeks)"
            subtitle="Requires at least 40% retention"
            detail={`$${service.fillPrice}`}
            showChevron={false}
          />
        ) : null}
      </Card>

      <SectionTitle eyebrow="Keep them beautiful" title="Aftercare" />
      <Card alt>
        {service.aftercare.map((item) => (
          <View key={item} style={[styles.careRow, { marginBottom: spacing.sm }]}>
            <Ionicons name="sparkles-outline" size={16} color={palette.accentDeep} style={{ marginTop: 2 }} />
            <Text style={[typeScale.body, { color: palette.text, marginLeft: spacing.sm, flex: 1 }]}>{item}</Text>
          </View>
        ))}
      </Card>

      {service.durationMinutes > 0 ? (
        <Button
          title={`Book ${service.name}`}
          onPress={() => router.push({ pathname: '/(tabs)/book', params: { serviceId: service.id } })}
          style={{ marginTop: spacing.xl }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  careRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
