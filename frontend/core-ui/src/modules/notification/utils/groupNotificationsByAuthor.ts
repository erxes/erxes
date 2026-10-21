import type { TNotification } from 'ui-modules';

/** Groups only resolved authors; unrelated system notifications stay separate. */
export const groupNotificationsByAuthor = (
  notifications: TNotification[],
): { key: string; items: TNotification[] }[] => {
  const groups = new Map<string, { key: string; items: TNotification[] }>();
  for (const notification of notifications) {
    const key = notification.fromUser?._id
      ? `author:${notification.fromUser._id}`
      : `notification:${notification._id}`;
    const group = groups.get(key);
    if (group) group.items.push(notification);
    else groups.set(key, { key, items: [notification] });
  }
  return [...groups.values()];
};
