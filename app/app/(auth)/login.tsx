import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../src/auth/AuthContext';
import { Button } from '../../src/components/Button';
import { Screen } from '../../src/components/Screen';
import { TextField } from '../../src/components/TextField';
import { useTheme } from '../../src/theme/ThemeContext';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn } = useAuth();
  const { palette, spacing, typeScale, fonts } = theme;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    setError(null);
    setSubmitting(true);
    try {
      // Mock auth: any valid email plus a 6+ character password signs in.
      await signIn(email, password);
      // Navigation is handled by the auth gate in app/_layout.tsx.
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <View style={styles.center}>
          <Text style={[typeScale.label, { color: palette.accentDeep, textAlign: 'center' }]}>
            Lash Studio
          </Text>
          <Text
            accessibilityRole="header"
            style={{
              fontFamily: fonts.serif,
              fontSize: 44,
              color: palette.heading,
              textAlign: 'center',
              marginTop: spacing.xs,
            }}
          >
            Glow
          </Text>
          <Text
            style={[
              typeScale.body,
              { color: palette.muted, textAlign: 'center', marginTop: spacing.sm, marginBottom: spacing.xl },
            ]}
          >
            Wake up beautiful.
          </Text>

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

          <Button title="Sign In" onPress={handleSignIn} loading={submitting} />

          <Link href="/(auth)/forgot-password" asChild>
            <Pressable accessibilityRole="link" style={{ marginTop: spacing.lg, alignSelf: 'center' }}>
              <Text style={[typeScale.small, { color: palette.accentDeep }]}>Forgot your password?</Text>
            </Pressable>
          </Link>

          <View style={[styles.footerRow, { marginTop: spacing.xl }]}>
            <Text style={[typeScale.small, { color: palette.muted }]}>New to the atelier? </Text>
            <Link href="/(auth)/register" asChild>
              <Pressable accessibilityRole="link">
                <Text style={[typeScale.small, { color: palette.accentDeep, fontWeight: '500' }]}>
                  Create an account
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  center: { flex: 1, justifyContent: 'center' },
  footerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
});
