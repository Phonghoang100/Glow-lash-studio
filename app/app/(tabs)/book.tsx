import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addDays, format, isSameDay, startOfDay } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { Avatar } from '../../src/components/Avatar';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { EmptyState } from '../../src/components/EmptyState';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { findService, locations } from '../../src/data/mock';
import { scheduleAppointmentReminders } from '../../src/notifications';
import { useTheme } from '../../src/theme/ThemeContext';
import { Appointment, Artist, LocationId, Service, TimeSlot } from '../../src/types';

type Step = 'location' | 'service' | 'artist' | 'time' | 'confirm' | 'success';

const DEPOSIT = 30;

export default function BookScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ rescheduleId?: string; serviceId?: string }>();
  const { palette, spacing, typeScale, fonts, radii } = theme;

  const [step, setStep] = useState<Step>('location');
  const [services, setServices] = useState<Service[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [locationId, setLocationId] = useState<LocationId | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [artist, setArtist] = useState<Artist | null>(null);
  const [selectedDay, setSelectedDay] = useState<Date>(startOfDay(addDays(new Date(), 1)));
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState<Appointment | null>(null);
  const [rescheduleOf, setRescheduleOf] = useState<Appointment | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 14-day strip beginning tomorrow.
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, index) => startOfDay(addDays(new Date(), index + 1))),
    []
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [serviceList, artistList] = await Promise.all([api.getServices(), api.getArtists()]);
      if (!cancelled) {
        setServices(serviceList);
        setArtists(artistList);
        setLoadingCatalog(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Reschedule mode: preload selections from the existing appointment.
  useEffect(() => {
    if (!params.rescheduleId || loadingCatalog) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const existing = await api.getAppointment(params.rescheduleId as string);
        if (cancelled) {
          return;
        }
        setRescheduleOf(existing);
        setLocationId(existing.locationId);
        setService(findService(existing.serviceId) ?? null);
        setArtist(artists.find((a) => a.id === existing.artistId) ?? null);
        setStep('time');
      } catch {
        setError('That appointment could not be loaded for rescheduling.');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.rescheduleId, loadingCatalog, artists]);

  // Deep link from service detail: preselect the service.
  useEffect(() => {
    if (params.serviceId && !loadingCatalog && !service) {
      const preselected = services.find((s) => s.id === params.serviceId);
      if (preselected) {
        setService(preselected);
      }
    }
  }, [params.serviceId, loadingCatalog, services, service]);

  const loadSlots = useCallback(async () => {
    if (!artist) {
      return;
    }
    setSlotsLoading(true);
    setSelectedSlot(null);
    try {
      const result = await api.getAvailability(selectedDay, artist.id);
      setSlots(result);
    } finally {
      setSlotsLoading(false);
    }
  }, [artist, selectedDay]);

  useEffect(() => {
    if (step === 'time') {
      loadSlots();
    }
  }, [step, loadSlots]);

  const resetFlow = () => {
    setStep('location');
    setLocationId(null);
    setService(null);
    setArtist(null);
    setSelectedSlot(null);
    setConfirmed(null);
    setRescheduleOf(null);
    setError(null);
    // Clear route params so a completed reschedule doesn't re-trigger.
    router.setParams({ rescheduleId: '', serviceId: '' });
  };

  const handleConfirm = async () => {
    if (!service || !artist || !locationId || !selectedSlot) {
      return;
    }
    setBooking(true);
    setError(null);
    try {
      const appointment = await api.bookAppointment({
        serviceId: service.id,
        artistId: artist.id,
        locationId,
        startsAt: selectedSlot,
        rescheduleOfId: rescheduleOf?.id,
      });
      // Local reminders: 24h and 2h before the appointment.
      await scheduleAppointmentReminders(appointment, service);
      setConfirmed(appointment);
      setStep('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Try again.');
    } finally {
      setBooking(false);
    }
  };

  const availableArtists = useMemo(
    () => artists.filter((a) => (locationId ? a.locations.includes(locationId) : true)),
    [artists, locationId]
  );

  if (loadingCatalog) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  const stepIndex: Record<Step, number> = { location: 1, service: 2, artist: 3, time: 4, confirm: 5, success: 5 };

  return (
    <Screen scroll edges={['left', 'right']}>
      {step !== 'success' ? (
        <Text style={[typeScale.label, { color: palette.accentDeep }]}>
          {rescheduleOf ? 'Rescheduling' : 'New appointment'} · Step {stepIndex[step]} of 5
        </Text>
      ) : null}

      {step === 'location' ? (
        <>
          <SectionTitle eyebrow="Where" title="Choose your studio" />
          {locations.map((location) => (
            <Card
              key={location.id}
              onPress={() => {
                setLocationId(location.id);
                setStep('service');
              }}
              accessibilityLabel={`${location.name} studio`}
              style={{ marginBottom: spacing.md }}
            >
              <Text style={[typeScale.heading, { color: palette.heading }]}>{location.name}</Text>
              <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.xs }]}>
                {location.address}
              </Text>
              <Text style={[typeScale.small, { color: palette.muted, marginTop: 2 }]}>{location.hours}</Text>
            </Card>
          ))}
        </>
      ) : null}

      {step === 'service' ? (
        <>
          <SectionTitle eyebrow="What" title="Choose your service" />
          {services
            .filter((s) => s.durationMinutes > 0)
            .map((item) => (
              <ListRow
                key={item.id}
                title={item.name}
                subtitle={`${item.durationMinutes} min · ${item.shortDescription}`}
                detail={`$${item.price}`}
                onPress={() => {
                  setService(item);
                  setStep('artist');
                }}
              />
            ))}
          <Button title="Back" variant="ghost" onPress={() => setStep('location')} style={{ marginTop: spacing.lg }} />
        </>
      ) : null}

      {step === 'artist' ? (
        <>
          <SectionTitle eyebrow="With whom" title="Choose your artist" />
          {availableArtists.length === 0 ? (
            <EmptyState
              title="No artists at this studio"
              message="Try the other studio, or message the front desk and we will find you a time."
            />
          ) : (
            availableArtists.map((item) => (
              <Card
                key={item.id}
                onPress={() => {
                  setArtist(item);
                  setStep('time');
                }}
                accessibilityLabel={`Book with ${item.name}`}
                style={{ marginBottom: spacing.md }}
              >
                <View style={styles.artistRow}>
                  <Avatar name={item.name} uri={item.avatarUrl} size={52} />
                  <View style={{ marginLeft: spacing.md, flex: 1 }}>
                    <Text style={[typeScale.heading, { color: palette.heading, fontSize: 17 }]}>{item.name}</Text>
                    <Text style={[typeScale.small, { color: palette.muted }]}>{item.title}</Text>
                    <Text style={[typeScale.small, { color: palette.accentDeep, marginTop: 2 }]}>
                      {item.specialties.join(' · ')}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
          <Button title="Back" variant="ghost" onPress={() => setStep('service')} style={{ marginTop: spacing.sm }} />
        </>
      ) : null}

      {step === 'time' ? (
        <>
          <SectionTitle eyebrow="When" title={`Availability with ${artist?.name ?? 'your artist'}`} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
            {days.map((day) => {
              const selected = isSameDay(day, selectedDay);
              return (
                <Pressable
                  key={day.toISOString()}
                  accessibilityRole="button"
                  accessibilityLabel={format(day, 'EEEE, MMMM d')}
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedDay(day)}
                  style={[
                    styles.dayChip,
                    {
                      backgroundColor: selected ? palette.accent : palette.surface,
                      borderColor: selected ? palette.accent : palette.border,
                      borderRadius: radii.sm,
                      marginRight: spacing.sm,
                    },
                  ]}
                >
                  <Text style={[typeScale.label, { color: selected ? palette.onAccent : palette.muted, fontSize: 10 }]}>
                    {format(day, 'EEE')}
                  </Text>
                  <Text
                    style={{
                      fontFamily: fonts.serif,
                      fontSize: 20,
                      color: selected ? palette.onAccent : palette.heading,
                    }}
                  >
                    {format(day, 'd')}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {slotsLoading ? (
            <ActivityIndicator size="small" color={palette.accent} style={{ marginVertical: spacing.lg }} />
          ) : slots.filter((slot) => slot.available).length === 0 ? (
            <EmptyState
              icon="moon-outline"
              title={slots.length === 0 ? 'Studio closed' : 'Fully booked'}
              message={
                slots.length === 0
                  ? 'The studio is closed this day. Choose another date.'
                  : 'No open times remain on this day. Try a nearby date.'
              }
            />
          ) : (
            <View style={styles.slotWrap}>
              {slots
                .filter((slot) => slot.available)
                .map((slot) => {
                  const selected = selectedSlot === slot.startsAt;
                  return (
                    <Pressable
                      key={slot.startsAt}
                      accessibilityRole="button"
                      accessibilityLabel={`${format(new Date(slot.startsAt), 'h:mm a')}`}
                      accessibilityState={{ selected }}
                      onPress={() => setSelectedSlot(slot.startsAt)}
                      style={[
                        styles.slotChip,
                        {
                          backgroundColor: selected ? palette.accent : palette.surface,
                          borderColor: selected ? palette.accent : palette.border,
                          borderRadius: radii.sm,
                          marginRight: spacing.sm,
                          marginBottom: spacing.sm,
                        },
                      ]}
                    >
                      <Text style={[typeScale.small, { color: selected ? palette.onAccent : palette.text }]}>
                        {format(new Date(slot.startsAt), 'h:mm a')}
                      </Text>
                    </Pressable>
                  );
                })}
            </View>
          )}

          <Button
            title="Continue"
            onPress={() => setStep('confirm')}
            disabled={!selectedSlot}
            style={{ marginTop: spacing.lg }}
          />
          {!rescheduleOf ? (
            <Button title="Back" variant="ghost" onPress={() => setStep('artist')} style={{ marginTop: spacing.sm }} />
          ) : null}
        </>
      ) : null}

      {step === 'confirm' && service && artist && locationId && selectedSlot ? (
        <>
          <SectionTitle eyebrow="Almost done" title="Confirm your appointment" />
          <Card>
            <ListRow title="Service" detail={service.name} showChevron={false} />
            <ListRow title="Artist" detail={artist.name} showChevron={false} />
            <ListRow
              title="Studio"
              detail={locations.find((l) => l.id === locationId)?.name ?? ''}
              showChevron={false}
            />
            <ListRow
              title="Time"
              detail={format(new Date(selectedSlot), 'EEE, MMM d · h:mm a')}
              showChevron={false}
            />
            <ListRow title="Service price" detail={`$${service.price}`} showChevron={false} />
            <ListRow title="Deposit due today" detail={`$${DEPOSIT}`} showChevron={false} />
            <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.md }]}>
              The ${DEPOSIT} deposit applies toward your service and is refundable up to 24 hours before your
              appointment.{rescheduleOf ? ' Your original appointment will be released.' : ''}
            </Text>
          </Card>
          {error ? (
            <Text accessibilityRole="alert" style={[typeScale.small, { color: palette.danger, marginTop: spacing.md }]}>
              {error}
            </Text>
          ) : null}
          <Button
            title={rescheduleOf ? 'Confirm New Time' : `Confirm & Pay $${DEPOSIT} Deposit`}
            onPress={handleConfirm}
            loading={booking}
            style={{ marginTop: spacing.lg }}
          />
          <Button title="Back" variant="ghost" onPress={() => setStep('time')} style={{ marginTop: spacing.sm }} />
        </>
      ) : null}

      {step === 'success' && confirmed && service ? (
        <View style={{ paddingTop: spacing.xxl, alignItems: 'center' }}>
          <Ionicons name="checkmark-circle-outline" size={48} color={palette.accent} />
          <Text
            accessibilityRole="header"
            style={{ fontFamily: fonts.serif, fontSize: 28, color: palette.heading, marginTop: spacing.md }}
          >
            {rescheduleOf ? 'Rescheduled' : 'Reserved'}
          </Text>
          <Text
            style={[typeScale.body, { color: palette.muted, textAlign: 'center', marginTop: spacing.sm }]}
          >
            {service.name} · {format(new Date(confirmed.startsAt), 'EEEE, MMMM d at h:mm a')}.{'\n'}
            Reminders are set for 24 hours and 2 hours before.
          </Text>
          <Button
            title="View Appointment"
            onPress={() => {
              const id = confirmed.id;
              resetFlow();
              router.push(`/appointment/${id}`);
            }}
            style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
          />
          <Button
            title="Done"
            variant="ghost"
            onPress={() => {
              resetFlow();
              router.push('/(tabs)');
            }}
            style={{ marginTop: spacing.sm, alignSelf: 'stretch' }}
          />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  artistRow: { flexDirection: 'row', alignItems: 'center' },
  dayChip: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth },
  slotWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  slotChip: { paddingVertical: 10, paddingHorizontal: 14, borderWidth: StyleSheet.hairlineWidth },
});
