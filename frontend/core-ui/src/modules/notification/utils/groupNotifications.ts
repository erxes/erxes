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
    let key = '';
    if (grouping === 'plugin') {
      key = item.contentType?.split(/[:.]/)[0] || systemLabel;
    } else if (grouping === 'date') {
      key = new Date(item.createdAt).toLocaleDateString(language);
    }
    const group = groups.get(key);
    if (group) group.push(item);
    else groups.set(key, [item]);
  }
  return [...groups.entries()];
};
