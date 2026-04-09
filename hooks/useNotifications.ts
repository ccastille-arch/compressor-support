import { useEffect, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Database } from '../db/schema';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function registerForPushNotifications() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('maintenance', {
      name: 'Maintenance Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return true;
}

export async function scheduleMaintenanceReminders(db: Database) {
  // Cancel all existing scheduled notifications
  await Notifications.cancelAllScheduledNotificationsAsync();

  try {
    const upcoming = await db.getAllAsync<{
      id: string;
      task_name: string;
      next_due: string;
      equipment_id: string;
    }>(
      `SELECT ms.*, e.name as equipment_name
       FROM maintenance_schedule ms
       JOIN equipment e ON e.id = ms.equipment_id
       WHERE ms.next_due IS NOT NULL
       ORDER BY ms.next_due ASC
       LIMIT 50`
    );

    for (const item of upcoming) {
      const dueDate = new Date(item.next_due);
      const now = new Date();

      // Schedule reminder 1 day before due
      const reminderDate = new Date(dueDate);
      reminderDate.setDate(reminderDate.getDate() - 1);

      if (reminderDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Maintenance Due Tomorrow',
            body: `${item.task_name} - ${(item as any).equipment_name}`,
            data: { equipmentId: item.equipment_id, scheduleId: item.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: reminderDate,
          },
        });
      }

      // Schedule notification on due date
      if (dueDate > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Maintenance Due Now',
            body: `${item.task_name} - ${(item as any).equipment_name}`,
            data: { equipmentId: item.equipment_id, scheduleId: item.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: dueDate,
          },
        });
      }
    }
  } catch (error) {
    console.warn('Failed to schedule maintenance reminders:', error);
  }
}

export function useNotificationListener() {
  const notificationListener = useRef<Notifications.EventSubscription>(null);
  const responseListener = useRef<Notifications.EventSubscription>(null);

  useEffect(() => {
    registerForPushNotifications();

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.log('Notification received:', notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const data = response.notification.request.content.data;
        console.log('Notification tapped:', data);
      }
    );

    return () => {
      if (notificationListener.current) notificationListener.current.remove();
      if (responseListener.current) responseListener.current.remove();
    };
  }, []);
}
