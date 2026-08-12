import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { format } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../src/api/client';
import { EmptyState } from '../../src/components/EmptyState';
import { Screen } from '../../src/components/Screen';
import { useTheme } from '../../src/theme/ThemeContext';
import { Message } from '../../src/types';

export default function MessagesScreen() {
  const { theme } = useTheme();
  const { palette, spacing, typeScale, radii } = theme;

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    let cancelled = false;
    api.getMessages().then((thread) => {
      if (!cancelled) {
        setMessages(thread);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) {
      return;
    }
    setSending(true);
    setDraft('');
    try {
      const updated = await api.sendMessage(body);
      setMessages(updated);
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } finally {
      setSending(false);
    }
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

  return (
    <Screen edges={['left', 'right']} contentStyle={{ padding: 0 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
        style={styles.flex}
      >
        {messages.length === 0 ? (
          <EmptyState
            icon="chatbubble-outline"
            title="Start the conversation"
            message="This thread reaches the front desk at both studios."
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ padding: spacing.lg }}
            onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
            renderItem={({ item }) => {
              const isClient = item.from === 'client';
              return (
                <View
                  accessibilityLabel={`${isClient ? 'You' : 'Studio'}: ${item.body}`}
                  style={[
                    styles.bubble,
                    {
                      alignSelf: isClient ? 'flex-end' : 'flex-start',
                      backgroundColor: isClient ? palette.accent : palette.surface,
                      borderColor: palette.border,
                      borderRadius: radii.md,
                      marginBottom: spacing.md,
                      padding: spacing.md,
                    },
                  ]}
                >
                  <Text style={[typeScale.body, { color: isClient ? palette.onAccent : palette.text }]}>
                    {item.body}
                  </Text>
                  <Text
                    style={[
                      typeScale.small,
                      {
                        color: isClient ? palette.onAccent : palette.muted,
                        opacity: 0.7,
                        marginTop: spacing.xs,
                        fontSize: 11,
                      },
                    ]}
                  >
                    {format(new Date(item.sentAt), 'MMM d · h:mm a')}
                  </Text>
                </View>
              );
            }}
          />
        )}

        <View
          style={[
            styles.composer,
            {
              borderTopColor: palette.border,
              backgroundColor: palette.surface,
              padding: spacing.md,
            },
          ]}
        >
          <TextInput
            accessibilityLabel="Message the studio"
            value={draft}
            onChangeText={setDraft}
            placeholder="Message the front desk…"
            placeholderTextColor={palette.muted}
            multiline
            style={[
              styles.input,
              typeScale.body,
              {
                color: palette.text,
                backgroundColor: palette.background,
                borderColor: palette.border,
                borderRadius: radii.sm,
                paddingHorizontal: spacing.md,
              },
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send message"
            accessibilityState={{ disabled: !draft.trim() || sending }}
            onPress={send}
            disabled={!draft.trim() || sending}
            style={({ pressed }) => [
              styles.sendButton,
              {
                backgroundColor: palette.accent,
                borderRadius: radii.sm,
                marginLeft: spacing.sm,
                opacity: !draft.trim() || sending ? 0.5 : pressed ? 0.85 : 1,
              },
            ]}
          >
            {sending ? (
              <ActivityIndicator size="small" color={palette.onAccent} />
            ) : (
              <Ionicons name="arrow-up" size={20} color={palette.onAccent} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bubble: { maxWidth: '82%', borderWidth: StyleSheet.hairlineWidth },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  input: { flex: 1, minHeight: 44, maxHeight: 120, paddingTop: 12, borderWidth: StyleSheet.hairlineWidth },
  sendButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
