import { TNotification } from 'ui-modules';

const DAY = 864e5;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

/** Translation keys under `notification` in common.json. */
const dayKey = (createdAt: string) => {
  const days = Math.round(
    (startOfDay(new Date()) - startOfDay(new Date(createdAt))) / DAY,
  );

  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return 'this-week';

  return 'older';
};

/** Groups notifications under today, yesterday, this week and older. */
export const groupNotificationsByDay = (notifications: TNotification[]) => {
  const groups = new Map<ReturnType<typeof dayKey>, TNotification[]>();

  notifications.forEach((notification) => {
    const day = dayKey(notification.createdAt);

    groups.set(day, [...(groups.get(day) ?? []), notification]);
  });

  return [...groups].map(([day, items]) => ({ day, items }));
};
