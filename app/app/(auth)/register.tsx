import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useTheme } from '../../src/theme/ThemeContext';

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { register } = useAuth();
  const { palette, spacing, typeScale, fonts } = theme;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleRegister = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await register(firstName, lastName, email, password);
      // The auth gate in app/_layout.tsx routes into the tabs on success.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Text style={[typeScale.label, { color: palette.accentDeep, marginTop: spacing.xl }]}>
          The Atelier Awaits
        </Text>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: fonts.serif,
            fontSize: 32,
            color: palette.heading,
            marginTop: spacing.xs,
            marginBottom: spacing.sm,
          }}
        >
          Create your account
        </Text>
        <Text style={[typeScale.body, { color: palette.muted, marginBottom: spacing.xl }]}>
          New-client sets include a consultation and an aftercare kit. Your account keeps
          appointments, loyalty points, and preferences in one place.
        </Text>

        <View style={styles.nameRow}>
          <View style={[styles.nameCol, { marginRight: spacing.sm }]}>
            <TextField label="First name" value={firstName} onChangeText={setFirstName} autoCapitalize="words" />
          </View>
          <View style={styles.nameCol}>
            <TextField label="Last name" value={lastName} onChangeText={setLastName} autoCapitalize="words" />
          </View>
        </View>
        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          placeholder="At least 6 characters"
          secureTextEntry
        />

        {error ? (
          <Text
            accessibilityRole="alert"
            style={[typeScale.small, { color: palette.danger, marginBottom: spacing.md }]}
          >
            {error}
          </Text>
        ) : null}

        <Button title="Create Account" onPress={handleRegister} loading={submitting} />

        <View style={[styles.footerRow, { marginTop: spacing.xl }]}>
          <Text style={[typeScale.small, { color: palette.muted }]}>Already with us? </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable accessibilityRole="link">
              <Text style={[typeScale.small, { color: palette.accentDeep, fontWeight: '500' }]}>Sign in</Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  nameRow: { flexDirection: 'row' },
  nameCol: { flex: 1 },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
