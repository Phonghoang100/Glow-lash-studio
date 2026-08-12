import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { findArtist, findLocation, findService } from '../../src/data/mock';
import { cancelAppointmentReminders } from '../../src/notifications';
import { useTheme } from '../../src/theme/ThemeContext';
import { Appointment, GalleryItem, LoyaltyAccount } from '../../src/types';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const { palette, spacing, typeScale, fonts, radii } = theme;

  const [loading, setLoading] = useState(true);
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);

  const load = useCallback(async () => {
    try {
      const [appointments, loyaltyAccount, galleryItems] = await Promise.all([
        api.getAppointments(),
        api.getLoyaltyAccount(),
        api.getGallery(),
      ]);
      const upcoming = appointments
        .filter((apt) => apt.status === 'confirmed' && new Date(apt.startsAt) > new Date())
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
      setNextAppointment(upcoming[0] ?? null);
      setLoyalty(loyaltyAccount);
      setGallery(galleryItems);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleCancel = () => {
    if (!nextAppointment) {
      return;
    }
    Alert.alert(
      'Cancel appointment',
      'Cancellations within 24 hours forfeit the $30 deposit. Cancel this appointment?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel appointment',
          style: 'destructive',
          onPress: async () => {
            await api.cancelAppointment(nextAppointment.id);
            await cancelAppointmentReminders(nextAppointment.id);
            setLoading(true);
            load();
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  const service = nextAppointment ? findService(nextAppointment.serviceId) : undefined;
  const artist = nextAppointment ? findArtist(nextAppointment.artistId) : undefined;
  const location = nextAppointment ? findLocation(nextAppointment.locationId) : undefined;
  const pointsProgress = loyalty ? Math.min(loyalty.points / loyalty.nextRewardAt, 1) : 0;

  return (
    <Screen scroll edges={['left', 'right']}>
      <Text style={[typeScale.label, { color: palette.accentDeep }]}>
        {format(new Date(), 'EEEE, MMMM d')}
      </Text>
      <Text
        accessibilityRole="header"
        style={{ fontFamily: fonts.serif, fontSize: 30, color: palette.heading, marginTop: spacing.xs }}
      >
        Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
        {user?.firstName ?? 'there'}.
      </Text>

      <SectionTitle eyebrow="Up next" title="Your appointment" />
      {nextAppointment && service && artist && location ? (
        <Card>
          <View style={styles.rowBetween}>
            <Text style={[typeScale.heading, { color: palette.heading }]}>{service.name}</Text>
            <Badge label="Confirmed" tone="success" />
          </View>
          <Text style={[typeScale.body, { color: palette.text, marginTop: spacing.sm }]}>
            {format(new Date(nextAppointment.startsAt), 'EEEE, MMMM d · h:mm a')}
          </Text>
          <Text style={[typeScale.small, { color: palette.muted, marginTop: 2 }]}>
            {artist.name} · {location.name} studio
          </Text>
          <View style={[styles.actionsRow, { marginTop: spacing.md }]}>
            <Button
              title="Details"
              variant="secondary"
              onPress={() => router.push(`/appointment/${nextAppointment.id}`)}
              style={styles.actionButton}
            />
            <Button
              title="Reschedule"
              variant="ghost"
              onPress={() =>
                router.push({ pathname: '/(tabs)/book', params: { rescheduleId: nextAppointment.id } })
              }
              style={styles.actionButton}
            />
            <Button title="Cancel" variant="danger" onPress={handleCancel} style={styles.actionButton} />
          </View>
        </Card>
      ) : (
        <Card alt>
          <EmptyState
            icon="calendar-outline"
            title="Nothing on the books"
            message="Your lashes deserve a standing appointment. Reserve your next visit."
            actionTitle="Book Now"
            onAction={() => router.push('/(tabs)/book')}
          />
        </Card>
      )}

      <SectionTitle eyebrow="The Glow Circle" title="Loyalty & membership" />
      {loyalty ? (
        <Card>
          <View style={styles.rowBetween}>
            <View>
              <Text style={{ fontFamily: fonts.serif, fontSize: 34, color: palette.heading }}>
                {loyalty.points}
                <Text style={[typeScale.small, { color: palette.muted }]}> pts</Text>
              </Text>
              <Text style={[typeScale.small, { color: palette.muted }]}>
                {Math.max(loyalty.nextRewardAt - loyalty.points, 0)} points to your next $25 credit
              </Text>
            </View>
            <Badge label={`${loyalty.tier} member`} tone="accent" />
          </View>
          {/* Progress ring rendered as a simple bar for zero-dependency clarity */}
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={`${loyalty.points} of ${loyalty.nextRewardAt} points`}
            style={[
              styles.progressTrack,
              { backgroundColor: palette.surfaceAlt, borderRadius: radii.pill, marginTop: spacing.md },
            ]}
          >
            <View
              style={[
                styles.progressFill,
                { width: `${pointsProgress * 100}%`, backgroundColor: palette.accent, borderRadius: radii.pill },
              ]}
            />
          </View>
          <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.md }]}>
            1 point per $1 · 250 points = $25 credit · ${loyalty.creditBalance} credit available
          </Text>
        </Card>
      ) : null}

      <SectionTitle eyebrow="Shortcuts" title="Quick actions" />
      <View style={styles.quickRow}>
        {[
          { icon: 'calendar-outline' as const, label: 'Book', onPress: () => router.push('/(tabs)/book') },
          { icon: 'gift-outline' as const, label: 'Gift Cards', onPress: () => router.push('/(tabs)/profile') },
          { icon: 'people-outline' as const, label: 'Refer', onPress: () => router.push('/(tabs)/profile') },
        ].map((action) => (
          <Card
            key={action.label}
            onPress={action.onPress}
            accessibilityLabel={action.label}
            style={{ ...styles.quickCard, marginRight: spacing.sm }}
          >
            <Ionicons name={action.icon} size={22} color={palette.accentDeep} />
            <Text style={[typeScale.label, { color: palette.heading, marginTop: spacing.sm, fontSize: 10 }]}>
              {action.label}
            </Text>
          </Card>
        ))}
      </View>

      <SectionTitle eyebrow="Recent work" title="From the studio" />
      {gallery.length === 0 ? (
        <EmptyState title="Gallery coming soon" message="New sets are photographed every week." />
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {gallery.slice(0, 4).map((item) => (
            <View key={item.id} style={{ marginRight: spacing.md }}>
              <Image
                accessibilityLabel={`${item.title} — after photo`}
                source={{ uri: item.afterUrl }}
                style={[styles.galleryImage, { borderRadius: radii.sm, backgroundColor: palette.surfaceAlt }]}
              />
              <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.xs }]}>
                {item.serviceName}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  actionsRow: { flexDirection: 'row' },
  actionButton: { flex: 1, marginRight: 8, minHeight: 40, paddingHorizontal: 8 },
  progressTrack: { height: 8, overflow: 'hidden' },
  progressFill: { height: 8 },
  quickRow: { flexDirection: 'row' },
  quickCard: { flex: 1, alignItems: 'center', paddingVertical: 20 },
  galleryImage: { width: 140, height: 170 },
});
