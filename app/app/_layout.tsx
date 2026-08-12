import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../src/auth/AuthContext';
import { ThemeProvider, useTheme } from '../src/theme/ThemeContext';

/**
 * Auth gate: while signed out, only the (auth) group is reachable;
 * once a token exists, the user is routed into the tabs.
 */
function RootNavigator() {
  const { theme } = useTheme();
  const { token, restoring } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (restoring) {
      return;
    }
    const inAuthGroup = segments[0] === '(auth)';
    if (!token && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (token && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [token, restoring, segments, router]);

  if (restoring) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: theme.palette.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.palette.accent} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={theme.isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: theme.palette.background },
          headerTintColor: theme.palette.heading,
          headerTitleStyle: { fontFamily: theme.fonts.serif, fontSize: 18 },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: theme.palette.background },
        }}
      >
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="appointment/[id]" options={{ title: 'Appointment' }} />
        <Stack.Screen name="service/[id]" options={{ title: 'Service' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}
