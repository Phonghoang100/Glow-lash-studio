import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import {
  darkPalette,
  fonts,
  lightPalette,
  radii,
  spacing,
  Theme,
  ThemeMode,
  typeScale,
} from './tokens';

const THEME_MODE_KEY = 'glow.themeMode';

interface ThemeContextValue {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  // Restore the persisted preference on launch.
  useEffect(() => {
    let cancelled = false;
    SecureStore.getItemAsync(THEME_MODE_KEY)
      .then((stored) => {
        if (!cancelled && (stored === 'light' || stored === 'dark' || stored === 'system')) {
          setModeState(stored);
        }
      })
      .catch(() => {
        // Non-fatal: fall back to system appearance.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    SecureStore.setItemAsync(THEME_MODE_KEY, next).catch(() => {
      // Persistence failure is non-fatal; the in-memory value still applies.
    });
  }, []);

  const isDark = mode === 'dark' || (mode === 'system' && systemScheme === 'dark');

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme: {
        palette: isDark ? darkPalette : lightPalette,
        spacing,
        radii,
        fonts,
        typeScale,
        isDark,
      },
      mode,
      setMode,
    }),
    [isDark, mode, setMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return ctx;
}
