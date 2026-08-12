import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { useAuth } from '../../src/auth/AuthContext';
import { Avatar } from '../../src/components/Avatar';
import { Badge } from '../../src/components/Badge';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { ListRow } from '../../src/components/ListRow';
import { Screen } from '../../src/components/Screen';
import { SectionTitle } from '../../src/components/SectionTitle';
import { TextField } from '../../src/components/TextField';
import { artists, findService, services } from '../../src/data/mock';
import { useTheme } from '../../src/theme/ThemeContext';
import { ThemeMode } from '../../src/theme/tokens';
import { Appointment, GiftCard, LoyaltyAccount, PaymentMethod, UserProfile } from '../../src/types';

export default function ProfileScreen() {
  const { theme, mode, setMode } = useTheme();
  const { user, signOut, refreshUser } = useAuth();
  const router = useRouter();
  const { palette, spacing, typeScale, fonts, radii } = theme;

  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<Appointment[]>([]);
  const [cards, setCards] = useState<PaymentMethod[]>([]);
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loyalty, setLoyalty] = useState<LoyaltyAccount | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(user);

  const [showAddCard, setShowAddCard] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [appointments, paymentMethods, giftCardList, loyaltyAccount, freshProfile] = await Promise.all([
        api.getAppointments(),
        api.getPaymentMethods(),
        api.getGiftCards(),
        api.getLoyaltyAccount(),
        api.getProfile(),
      ]);
      setHistory(appointments.filter((apt) => apt.status !== 'confirmed'));
      setCards(paymentMethods);
      setGiftCards(giftCardList);
      setLoyalty(loyaltyAccount);
      setProfile(freshProfile);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const toggleArtistFavorite = async (artistId: string) => {
    const updated = await api.toggleFavoriteArtist(artistId);
    setProfile(updated);
    await refreshUser();
  };

  const toggleServiceFavorite = async (serviceId: string) => {
    const updated = await api.toggleFavoriteService(serviceId);
    setProfile(updated);
    await refreshUser();
  };

  const toggleNotificationPref = async (key: keyof UserProfile['notificationPreferences'], value: boolean) => {
    if (!profile) {
      return;
    }
    const updated = await api.updateProfile({
      notificationPreferences: { ...profile.notificationPreferences, [key]: value },
    });
    setProfile(updated);
  };

  const addCard = async () => {
    setAddingCard(true);
    try {
      // Production: create a SetupIntent server-side, then present Stripe's
      // PaymentSheet here (@stripe/stripe-react-native). This mock appends a card.
      const added = await api.addPaymentMethod();
      setCards((prev) => [...prev, added]);
      setShowAddCard(false);
    } finally {
      setAddingCard(false);
    }
  };

  const redeemGiftCard = async () => {
    setRedeemError(null);
    setRedeeming(true);
    try {
      const card = await api.redeemGiftCard(redeemCode);
      setGiftCards((prev) => [...prev, card]);
      setRedeemCode('');
    } catch (err) {
      setRedeemError(err instanceof Error ? err.message : 'Could not redeem that code.');
    } finally {
      setRedeeming(false);
    }
  };

  const shareReferral = async () => {
    if (!loyalty) {
      return;
    }
    await Share.share({
      message: `My lash studio, Glow Lash Studio, gives new clients $25 off with my code ${loyalty.referralCode} — and I get $25 too. glowlashstudio.com`,
    });
  };

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Sign out of your Glow account?', [
      { text: 'Stay', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  if (loading || !profile) {
    return (
      <Screen edges={['left', 'right']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={palette.accent} />
        </View>
      </Screen>
    );
  }

  const giftCardBalance = giftCards.reduce((sum, card) => sum + card.balance, 0);
  const favoriteServices = services.filter((s) => profile.favoriteServiceIds.includes(s.id));

  return (
    <Screen scroll edges={['left', 'right']}>
      {/* Account header */}
      <View style={[styles.headerRow, { marginTop: spacing.sm }]}>
        <Avatar name={`${profile.firstName} ${profile.lastName}`} size={56} />
        <View style={{ marginLeft: spacing.md, flex: 1 }}>
          <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: palette.heading }}>
            {profile.firstName} {profile.lastName}
          </Text>
          <Text style={[typeScale.small, { color: palette.muted }]}>
            {profile.email} · {profile.phone}
          </Text>
        </View>
      </View>

      {/* Loyalty & referral */}
      <SectionTitle eyebrow="The Glow Circle" title="Loyalty & referral" />
      {loyalty ? (
        <Card>
          <View style={styles.rowBetween}>
            <Text style={[typeScale.body, { color: palette.text }]}>
              {loyalty.points} points · ${loyalty.creditBalance} credit
            </Text>
            <Badge label={loyalty.tier} tone="accent" />
          </View>
          <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.xs }]}>
            Member since {format(new Date(loyalty.memberSince), 'MMMM yyyy')} · 1 point per $1 · 250 points = $25
          </Text>
          <View
            style={[
              styles.referralBox,
              { backgroundColor: palette.surfaceAlt, borderRadius: radii.sm, marginTop: spacing.md, padding: spacing.md },
            ]}
          >
            <Text style={[typeScale.label, { color: palette.muted }]}>Give $25, get $25</Text>
            <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: palette.heading, marginTop: spacing.xs }}>
              {loyalty.referralCode}
            </Text>
          </View>
          <Button title="Share Your Code" onPress={shareReferral} style={{ marginTop: spacing.md }} />
        </Card>
      ) : null}

      {/* Gift cards */}
      <SectionTitle eyebrow="Balances" title="Gift cards" />
      <Card>
        <View style={styles.rowBetween}>
          <Text style={[typeScale.body, { color: palette.text }]}>Available balance</Text>
          <Text style={{ fontFamily: fonts.serif, fontSize: 22, color: palette.heading }}>
            ${giftCardBalance}
          </Text>
        </View>
        {giftCards.map((card) => (
          <ListRow
            key={card.id}
            title={card.code}
            subtitle={`Purchased ${format(new Date(card.purchasedAt), 'MMM d, yyyy')} · originally $${card.originalAmount}`}
            detail={`$${card.balance}`}
            showChevron={false}
          />
        ))}
        <View style={{ marginTop: spacing.md }}>
          <TextField
            label="Redeem a gift card"
            value={redeemCode}
            onChangeText={setRedeemCode}
            placeholder="SLA-XXXX-XXXX"
            autoCapitalize="characters"
          />
          {redeemError ? (
            <Text accessibilityRole="alert" style={[typeScale.small, { color: palette.danger, marginBottom: spacing.sm }]}>
              {redeemError}
            </Text>
          ) : null}
          <Button
            title="Redeem"
            variant="secondary"
            onPress={redeemGiftCard}
            loading={redeeming}
            disabled={!redeemCode.trim()}
          />
        </View>
      </Card>

      {/* Payment methods */}
      <SectionTitle eyebrow="Billing" title="Payment methods" />
      <Card>
        {cards.length === 0 ? (
          <Text style={[typeScale.small, { color: palette.muted }]}>No cards on file yet.</Text>
        ) : (
          cards.map((card) => (
            <ListRow
              key={card.id}
              icon="card-outline"
              title={`${card.brand} •••• ${card.last4}`}
              subtitle={`Expires ${String(card.expMonth).padStart(2, '0')}/${card.expYear}`}
              right={card.isDefault ? <Badge label="Default" tone="muted" /> : <View />}
            />
          ))
        )}
        <Button title="Add Card" variant="secondary" onPress={() => setShowAddCard(true)} style={{ marginTop: spacing.md }} />
      </Card>

      {/* Favorites */}
      <SectionTitle eyebrow="Yours" title="Favorites" />
      <Card>
        <Text style={[typeScale.label, { color: palette.muted, marginBottom: spacing.xs }]}>Artists</Text>
        {artists.map((artist) => {
          const isFavorite = profile.favoriteArtistIds.includes(artist.id);
          return (
            <ListRow
              key={artist.id}
              title={artist.name}
              subtitle={artist.specialties.join(' · ')}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite ? `Remove ${artist.name} from favorites` : `Add ${artist.name} to favorites`}
                  onPress={() => toggleArtistFavorite(artist.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? palette.accentDeep : palette.muted}
                  />
                </Pressable>
              }
            />
          );
        })}
        <Text style={[typeScale.label, { color: palette.muted, marginTop: spacing.md, marginBottom: spacing.xs }]}>
          Services
        </Text>
        {(favoriteServices.length > 0 ? favoriteServices : services.slice(0, 4)).map((service) => {
          const isFavorite = profile.favoriteServiceIds.includes(service.id);
          return (
            <ListRow
              key={service.id}
              title={service.name}
              detail={`$${service.price}`}
              right={
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isFavorite ? `Remove ${service.name} from favorites` : `Add ${service.name} to favorites`}
                  onPress={() => toggleServiceFavorite(service.id)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={isFavorite ? 'heart' : 'heart-outline'}
                    size={20}
                    color={isFavorite ? palette.accentDeep : palette.muted}
                  />
                </Pressable>
              }
            />
          );
        })}
      </Card>

      {/* Appointment history */}
      <SectionTitle eyebrow="Past visits" title="Appointment history" />
      <Card>
        {history.length === 0 ? (
          <Text style={[typeScale.small, { color: palette.muted }]}>No past appointments yet.</Text>
        ) : (
          history.map((apt) => {
            const service = findService(apt.serviceId);
            return (
              <ListRow
                key={apt.id}
                title={service?.name ?? 'Appointment'}
                subtitle={format(new Date(apt.startsAt), 'MMM d, yyyy · h:mm a')}
                right={<Badge label={apt.status === 'completed' ? 'Completed' : 'Cancelled'} tone={apt.status === 'completed' ? 'success' : 'muted'} />}
                onPress={() => router.push(`/appointment/${apt.id}`)}
              />
            );
          })
        )}
      </Card>

      {/* Forms */}
      <SectionTitle eyebrow="Records" title="Intake & consent" />
      <Card>
        <ListRow
          icon="document-text-outline"
          title="Intake form"
          subtitle="Health history and sensitivities"
          right={<Badge label={profile.intakeFormComplete ? 'Complete' : 'Needed'} tone={profile.intakeFormComplete ? 'success' : 'danger'} />}
        />
        <ListRow
          icon="create-outline"
          title="Consent form"
          subtitle="Service consent and photo release"
          right={<Badge label={profile.consentFormComplete ? 'Complete' : 'Needed'} tone={profile.consentFormComplete ? 'success' : 'danger'} />}
        />
        <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.sm }]}>
          Incomplete forms are presented at check-in on the studio iPad.
        </Text>
      </Card>

      {/* Appearance */}
      <SectionTitle eyebrow="Preferences" title="Appearance" />
      <Card>
        <View style={styles.rowBetween}>
          {(['light', 'dark', 'system'] as ThemeMode[]).map((option) => {
            const active = mode === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="button"
                accessibilityLabel={`${option} appearance`}
                accessibilityState={{ selected: active }}
                onPress={() => setMode(option)}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: active ? palette.accent : palette.surfaceAlt,
                    borderRadius: radii.sm,
                    marginRight: option !== 'system' ? spacing.sm : 0,
                  },
                ]}
              >
                <Text style={[typeScale.label, { color: active ? palette.onAccent : palette.muted }]}>
                  {option}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* Notifications */}
      <SectionTitle eyebrow="Preferences" title="Notifications" />
      <Card>
        <ListRow
          title="Appointment reminders"
          subtitle="24 hours and 2 hours before"
          right={
            <Switch
              accessibilityLabel="Appointment reminders"
              value={profile.notificationPreferences.appointmentReminders}
              onValueChange={(value) => toggleNotificationPref('appointmentReminders', value)}
              trackColor={{ true: palette.accent, false: palette.border }}
              thumbColor={palette.surface}
            />
          }
        />
        <ListRow
          title="Loyalty updates"
          subtitle="Points, credits, and tier changes"
          right={
            <Switch
              accessibilityLabel="Loyalty updates"
              value={profile.notificationPreferences.loyaltyUpdates}
              onValueChange={(value) => toggleNotificationPref('loyaltyUpdates', value)}
              trackColor={{ true: palette.accent, false: palette.border }}
              thumbColor={palette.surface}
            />
          }
        />
        <ListRow
          title="Occasional notes from the studio"
          subtitle="New artists, seasonal openings"
          right={
            <Switch
              accessibilityLabel="Occasional notes from the studio"
              value={profile.notificationPreferences.promotions}
              onValueChange={(value) => toggleNotificationPref('promotions', value)}
              trackColor={{ true: palette.accent, false: palette.border }}
              thumbColor={palette.surface}
            />
          }
        />
      </Card>

      <Button title="Sign Out" variant="danger" onPress={confirmSignOut} style={{ marginTop: spacing.xl }} />

      {/* Add-card sheet — Stripe PaymentSheet integration point */}
      <Modal visible={showAddCard} transparent animationType="slide" onRequestClose={() => setShowAddCard(false)}>
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.sheet,
              { backgroundColor: palette.surface, borderTopLeftRadius: radii.lg, borderTopRightRadius: radii.lg, padding: spacing.lg },
            ]}
          >
            <Text style={{ fontFamily: fonts.serif, fontSize: 24, color: palette.heading }}>Add a card</Text>
            <Text style={[typeScale.body, { color: palette.muted, marginTop: spacing.sm }]}>
              In production this sheet presents Stripe's PaymentSheet
              (@stripe/stripe-react-native). The backend creates a SetupIntent, the sheet
              collects and tokenizes the card, and only the payment method id is stored —
              card numbers never touch this app or our servers.
            </Text>
            <Text style={[typeScale.small, { color: palette.muted, marginTop: spacing.sm }]}>
              This demo adds a masked test card instead.
            </Text>
            <Button title="Add Test Card" onPress={addCard} loading={addingCard} style={{ marginTop: spacing.lg }} />
            <Button title="Close" variant="ghost" onPress={() => setShowAddCard(false)} style={{ marginTop: spacing.sm }} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerRow: { flexDirection: 'row', alignItems: 'center' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  referralBox: { alignItems: 'flex-start' },
  modeChip: { flex: 1, alignItems: 'center', paddingVertical: 12 },
  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(28, 25, 22, 0.5)' },
  sheet: { paddingBottom: 40 },
});
