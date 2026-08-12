import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Appointment, Service } from './types';

/**
 * Local notification support for appointment reminders.
 *
 * What this module does today (fully local, no server):
 *   - Requests notification permission on first use.
 *   - Schedules two local reminders per appointment: 24 hours before
 *     and 2 hours before the start time.
 *   - Cancels scheduled reminders when an appointment is cancelled
 *     or rescheduled.
 *
 * ── Production push integration point ────────────────────────────────────
 * For server-sent push (booking confirmations, front-desk replies):
 *   1. const token = (await Notifications.getExpoPushTokenAsync({
 *        projectId: '<your-eas-project-id>' })).data;
 *   2. POST that token to your backend, e.g.
 *        POST /me/push-tokens { token, platform: Platform.OS }
 *   3. Send pushes server-side via Expo's push API
 *      (https://docs.expo.dev/push-notifications/sending-notifications/).
 * Remember: push tokens require a physical device and, on Android,
 * an FCM configuration in app.json / EAS credentials.
 */

// Show alerts even when the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

/** Ask for permission (and create the Android channel). Returns whether granted. */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('appointments', {
      name: 'Appointment reminders',
      importance: Notifications.AndroidImportance.HIGH,
      lightColor: '#C9A96A',
    });
  }

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedules the 24h and 2h reminders for an appointment.
 * Returns the scheduled notification ids so they can be cancelled later.
 * Reminders that would land in the past are skipped.
 */
export async function scheduleAppointmentReminders(
  appointment: Appointment,
  service: Service
): Promise<string[]> {
  const granted = await requestNotificationPermission();
  if (!granted) {
    return [];
  }

  const startsAt = new Date(appointment.startsAt).getTime();
  const reminders: { offsetMs: number; body: string }[] = [
    {
      offsetMs: 24 * 60 * 60 * 1000, // 24 hours before
      body: `Your ${service.name} is tomorrow. Arrive with clean, makeup-free lashes.`,
    },
    {
      offsetMs: 2 * 60 * 60 * 1000, // 2 hours before
      body: `Your ${service.name} begins in two hours. We look forward to seeing you.`,
    },
  ];

  const ids: string[] = [];
  for (const reminder of reminders) {
    const fireDate = new Date(startsAt - reminder.offsetMs);
    if (fireDate.getTime() <= Date.now()) {
      continue; // Appointment is too soon for this reminder.
    }
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Glow Lash Studio',
        body: reminder.body,
        data: { appointmentId: appointment.id },
      },
      trigger: fireDate,
    });
    ids.push(id);
  }
  return ids;
}

/** Cancels every scheduled reminder tied to the given appointment. */
export async function cancelAppointmentReminders(appointmentId: string): Promise<void> {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const toCancel = scheduled.filter(
    (notification) => notification.content.data?.appointmentId === appointmentId
  );
  await Promise.all(
    toCancel.map((notification) =>
      Notifications.cancelScheduledNotificationAsync(notification.identifier)
    )
  );
}
