import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { api } from '../../src/api/client';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useTheme } from '../../src/theme/ThemeContext';

export default function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { palette, spacing, typeScale, fonts } = theme;

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await api.requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back to sign in"
        onPress={() => router.back()}
        style={{ marginTop: spacing.md, alignSelf: 'flex-start' }}
        hitSlop={8}
      >
        <Ionicons name="arrow-back" size={22} color={palette.heading} />
      </Pressable>

      <View style={styles.center}>
        {sent ? (
          <>
            <Ionicons name="mail-open-outline" size={36} color={palette.accent} style={styles.selfCenter} />
            <Text
              accessibilityRole="header"
              style={{
                fontFamily: fonts.serif,
                fontSize: 28,
                color: palette.heading,
                textAlign: 'center',
                marginTop: spacing.md,
              }}
            >
              Check your inbox
            </Text>
            <Text
              style={[
                typeScale.body,
                { color: palette.muted, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
              ]}
            >
              If an account exists for {email.trim()}, a reset link is on its way. It expires in one hour.
            </Text>
            <Button title="Back to Sign In" variant="secondary" onPress={() => router.back()} />
          </>
        ) : (
          <>
            <Text
              accessibilityRole="header"
              style={{ fontFamily: fonts.serif, fontSize: 28, color: palette.heading }}
            >
              Reset your password
            </Text>
            <Text style={[typeScale.body, { color: palette.muted, marginTop: spacing.sm, marginBottom: spacing.xl }]}>
              Enter the email on your account and we will send a reset link.
            </Text>
            <TextField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
            />
            {error ? (
              <Text
                accessibilityRole="alert"
                style={[typeScale.small, { color: palette.danger, marginBottom: spacing.md }]}
              >
                {error}
              </Text>
            ) : null}
            <Button title="Send Reset Link" onPress={handleReset} loading={submitting} />
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center' },
  selfCenter: { alignSelf: 'center' },
});
