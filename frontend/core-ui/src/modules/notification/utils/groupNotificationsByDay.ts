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

/** Groups notifications under Today, Yesterday, This week and Older. */
export const groupNotificationsByDay = (notifications: TNotification[]) => {
  const groups = new Map<string, TNotification[]>();

  notifications.forEach((notification) => {
    const label = dayLabel(notification.createdAt);

    groups.set(label, [...(groups.get(label) ?? []), notification]);
  });

  return [...groups].map(([label, items]) => ({ label, items }));
};
