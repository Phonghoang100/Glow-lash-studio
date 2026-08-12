import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api, setAuthToken } from '../api/client';
import { UserProfile } from '../types';

const TOKEN_KEY = 'glow.authToken';

interface AuthContextValue {
  /** Undefined while the stored token is being restored. */
  token: string | null;
  restoring: boolean;
  user: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [restoring, setRestoring] = useState(true);

  // Restore the session token from SecureStore on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const stored = await SecureStore.getItemAsync(TOKEN_KEY);
        if (stored && !cancelled) {
          setAuthToken(stored);
          const profile = await api.getProfile();
          if (!cancelled) {
            setToken(stored);
            setUser(profile);
          }
        }
      } catch {
        // Token invalid or expired — start signed out.
        await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
      } finally {
        if (!cancelled) {
          setRestoring(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistSession = useCallback(async (newToken: string, profile: UserProfile) => {
    await SecureStore.setItemAsync(TOKEN_KEY, newToken);
    setAuthToken(newToken);
    setToken(newToken);
    setUser(profile);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const session = await api.login(email, password);
      await persistSession(session.token, session.user);
    },
    [persistSession]
  );

  const register = useCallback(
    async (firstName: string, lastName: string, email: string, password: string) => {
      const session = await api.register(firstName, lastName, email, password);
      await persistSession(session.token, session.user);
    },
    [persistSession]
  );

  const signOut = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => undefined);
    setAuthToken(null);
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const profile = await api.getProfile();
    setUser(profile);
  }, []);

  const value = useMemo(
    () => ({ token, restoring, user, signIn, register, signOut, refreshUser }),
    [token, restoring, user, signIn, register, signOut, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
