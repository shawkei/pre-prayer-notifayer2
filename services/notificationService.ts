import { LocalNotifications } from '@capacitor/local-notifications';
import { PrayerTime } from '../types';

const CHANNEL_ID = 'prayer_alarms_v2';

// Helper to check if we are running in a native environment
const isNative = () => {
    return !!window.Capacitor?.isNativePlatform();
};

// IMPORTANT: Create a High Importance Channel for Android to allow sound
export const initializeNotifications = async () => {
  if (!isNative()) return;

  try {
    // Check if channel exists or create it
    const channels = await LocalNotifications.listChannels();
    const existing = channels.channels.find(c => c.id === CHANNEL_ID);

    if (!existing) {
      await LocalNotifications.createChannel({
        id: CHANNEL_ID,
        name: 'Prayer Alarms',
        description: 'High priority alerts for prayer times',
        importance: 5, // 5 = HIGH (Heads-up notification + Sound)
        visibility: 1, // Public
        sound: undefined, // undefined = System Default Sound
        vibration: true,
        lights: true,
        lightColor: '#10B981' // Emerald
      });
    }
  } catch (e) {
    console.error("Error creating channel", e);
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (isNative()) {
    const result = await LocalNotifications.requestPermissions();
    if (result.display === 'granted') {
        await initializeNotifications();
        return true;
    }
    return false;
  }

  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

export const sendNotification = async (title: string, body: string) => {
  if (isNative()) {
    // Ensure channel exists before sending
    await initializeNotifications();
    
    await LocalNotifications.schedule({
      notifications: [
        {
          title,
          body,
          id: new Date().getTime() & 0xffff, // Generate a unique short ID
          schedule: { at: new Date(new Date().getTime() + 1000) }, // 1 second from now
          channelId: CHANNEL_ID, // CRITICAL: Use the high-priority channel
          sound: undefined, // Use system default
          actionTypeId: "",
          extra: null
        }
      ]
    });
  } else {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
      });
    }
  }
};

export const schedulePrayerNotifications = async (
  prayers: PrayerTime[], 
  enabledPrayers: Record<string, boolean>,
  offsetMinutes: number,
  texts: { title: string, body: string }
) => {
  if (!isNative()) return;
  await initializeNotifications();

  // Cancel old ones to prevent duplicates
  const pending = await LocalNotifications.getPending();
  if (pending.notifications.length > 0) {
    await LocalNotifications.cancel(pending);
  }

  const notificationsToSchedule = [];
  const now = new Date();

  for (const prayer of prayers) {
    if (!enabledPrayers[prayer.id]) continue;

    const notifyTime = new Date(prayer.time.getTime() - (offsetMinutes * 60 * 1000));

    // Only schedule if it's in the future
    if (notifyTime > now) {
      notificationsToSchedule.push({
        title: texts.title,
        body: texts.body.replace('{min}', offsetMinutes.toString()) + ` (${prayer.nameArabic})`,
        id: prayer.time.getTime() & 0xffff,
        schedule: { 
            at: notifyTime,
            allowWhileIdle: true // CRITICAL for Android Doze mode
        },
        channelId: CHANNEL_ID, // Link to High Priority Channel
        sound: undefined, // System default
        smallIcon: 'ic_stat_notifications',
      });
    }
  }

  if (notificationsToSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: notificationsToSchedule });
  }
};