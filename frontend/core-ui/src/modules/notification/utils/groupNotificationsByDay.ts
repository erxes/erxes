import { TNotification } from 'ui-modules';

const DAY = 864e5;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const dayLabel = (createdAt: string) => {
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(createdAt))) / DAY,
  );

  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return 'This week';

  return 'Older';
};

/** Splits an already sorted list into Today, Yesterday, This week, Older. */
export const groupNotificationsByDay = (notifications: TNotification[]) =>
  notifications.reduce<{ label: string; items: TNotification[] }[]>(
    (groups, notification) => {
      const label = dayLabel(notification.createdAt);
      const last = groups[groups.length - 1];

      if (last?.label === label) {
        last.items.push(notification);
      } else {
        groups.push({ label, items: [notification] });
      }

      return groups;
    },
    [],
  );
