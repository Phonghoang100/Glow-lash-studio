import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { findArtist, findLocation, findService } from '../../src/data/mock';
import { cancelAppointmentReminders } from '../../src/notifications';
import { useTheme } from '../../src/theme/ThemeContext';
import { Appointment } from '../../src/types';

const PREP_CHECKLIST = [
  'Arrive with clean, makeup-free lashes',
  'Skip caffeine right before — you will lie still for a while',
  'Remove contact lenses if you wear them',
  'Silence your phone; the room is yours to rest in',
  'Plan to keep lashes dry for 24 hours after',
];

export default function AppointmentDetailScreen() {
  const { theme } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { palette, spacing, typeScale, fonts } = theme;

  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [working, setWorking] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      if (!id) {
        setLoading(false);
        return undefined;
      }
      api
        .getAppointment(id)
        .then((apt) => {
          if (!cancelled) {
            setAppointment(apt);
          }
        })
        .catch(() => {
          if (!cancelled) {
            setAppointment(null);
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
    }, [id])
  );

  const handleCancel = () => {
    if (!appointment) {
      return;
    }
    Alert.alert(
      'Cancel appointment',
      'Our cancellation policy: reschedule or cancel at least 24 hours ahead and your $30 deposit is returned or applied to a new booking. Within 24 hours, the deposit is forfeited. Cancel this appointment?',
      [
        { text: 'Keep it', style: 'cancel' },
        {
          text: 'Cancel appointment',
          style: 'destructive',
          onPress: async () => {
            setWorking(true);
            try {
              await api.cancelAppointment(appointment.id);
              await cancelAppointmentReminders(appointment.id);
              setAppointment({ ...appointment, status: 'cancelled' });
            } finally {
              setWorking(false);
            }
          },
        },
      ]
    );
  };

  const handleReschedule = () => {
    if (!appointment) {
      return;
    }
    Alert.alert(
      'Reschedule',
      'Pick a new time and your current slot is released. The deposit carries over when rescheduling more than 24 hours ahead.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Choose New Time',
          onPress: () =>
            router.push({ pathname: '/(tabs)/book', params: { rescheduleId: appointment.id } }),
        },
      ]
    );
  };

  if (loading) {
    return (
      <Screen>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  if (!appointment) {
    return (
      <Screen>
        <EmptyState
          icon="alert-circle-outline"
          title="Appointment not found"
          message="It may have been removed. Check your upcoming appointments on Home."
          actionTitle="Back"
          onAction={() => router.back()}
        />
      </Screen>
    );
  }

  const service = findService(appointment.serviceId);
  const artist = findArtist(appointment.artistId);
  const location = findLocation(appointment.locationId);
  const startsAt = new Date(appointment.startsAt);
  const isUpcoming = appointment.status === 'confirmed' && startsAt > new Date();

  return (
    <Screen scroll edges={['left', 'right']}>
      <View style={styles.headerRow}>
        <Text
          accessibilityRole="header"
          style={{ fontFamily: fonts.serif, fontSize: 28, color: palette.heading, flexShrink: 1 }}
        >
          {service?.name ?? 'Appointment'}
        </Text>
        <Badge
          label={appointment.status === 'confirmed' ? 'Confirmed' : appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
          tone={appointment.status === 'confirmed' ? 'success' : appointment.status === 'completed' ? 'accent' : 'muted'}
        />
      </View>
      <Text style={[typeScale.body, { color: palette.muted, marginTop: spacing.xs }]}>
        {format(startsAt, 'EEEE, MMMM d, yyyy · h:mm a')} · {appointment.durationMinutes} min
      </Text>

      <SectionTitle eyebrow="Details" title="Your visit" />
      <Card>
        {artist ? (
          <View style={[styles.artistRow, { marginBottom: spacing.sm }]}>
            <Avatar name={artist.name} uri={artist.avatarUrl} size={44} />
            <View style={{ marginLeft: spacing.md }}>
              <Text style={[typeScale.body, { color: palette.heading, fontWeight: '500' }]}>{artist.name}</Text>
              <Text style={[typeScale.small, { color: palette.muted }]}>{artist.title}</Text>
            </View>
          </View>
        ) : null}
        {location ? (
          <ListRow
            icon="location-outline"
            title={`${location.name} studio`}
            subtitle={location.address}
            showChevron={false}
          />
        ) : null}
        <ListRow icon="call-outline" title="Studio phone" subtitle={location?.phone ?? ''} showChevron={false} />
        <ListRow
          icon="cash-outline"
          title="Balance due at visit"
          subtitle={`$${appointment.priceAtBooking} service · $${appointment.depositPaid} deposit already paid`}
          detail={`$${appointment.priceAtBooking - appointment.depositPaid}`}
          showChevron={false}
        />
        {appointment.notes ? (
          <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.sm, fontStyle: 'italic' }]}>
            Note on file: {appointment.notes}
          </Text>
        ) : null}
      </Card>

      <SectionTitle eyebrow="Before you arrive" title="Prep checklist" />
      <Card alt>
        {PREP_CHECKLIST.map((item) => (
          <View key={item} style={[styles.checkRow, { marginBottom: spacing.sm }]}>
            <Ionicons name="checkmark-circle-outline" size={18} color={palette.accentDeep} />
            <Text style={[typeScale.body, { color: palette.text, marginLeft: spacing.sm, flex: 1 }]}>{item}</Text>
          </View>
        ))}
        <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.xs }]}>
          Tip: add this appointment to your calendar from the confirmation email, or ask the front
          desk to resend the invite.
        </Text>
      </Card>

      {isUpcoming ? (
        <>
          <Button title="Reschedule" onPress={handleReschedule} style={{ marginTop: spacing.xl }} />
          <Button
            title="Cancel Appointment"
            variant="danger"
            onPress={handleCancel}
            loading={working}
            style={{ marginTop: spacing.sm }}
          />
          <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.md, textAlign: 'center' }]}>
            Cancellation policy: full deposit back with 24+ hours' notice. Within 24 hours, the $30
            deposit is forfeited.
          </Text>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  artistRow: { flexDirection: 'row', alignItems: 'center' },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start' },
});
