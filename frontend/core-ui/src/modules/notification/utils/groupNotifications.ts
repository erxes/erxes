import type { TNotification } from 'ui-modules';
import type { InboxDisplayOptions } from '@/notification/states/notificationState';

export const groupNotifications = (
  notifications: TNotification[],
  grouping: InboxDisplayOptions['grouping'],
  language: string,
  systemLabel: string,
): [string, TNotification[]][] => {
  const groups = new Map<string, TNotification[]>();
  for (const item of notifications) {
    const key =
      grouping === 'plugin'
        ? item.contentType?.split(/[:.]/)[0] || systemLabel
        : grouping === 'date'
        ? new Date(item.createdAt).toLocaleDateString(language)
        : '';
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()];
};
