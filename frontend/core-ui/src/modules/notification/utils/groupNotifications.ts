import type { TNotification } from 'ui-modules';
import type { InboxDisplayOptions } from '@/notification/states/notificationState';

export const groupNotifications = (
  notifications: TNotification[],
  grouping: InboxDisplayOptions['grouping'],
  language: string,
  systemLabel: string,
  unreadFirst = false,
): [string, TNotification[]][] => {
  const groups = new Map<string, [string, TNotification[]]>();
  for (const item of notifications) {
    let label = '';
    if (grouping === 'plugin') {
      label = item.contentType?.split(/[:.]/)[0] || systemLabel;
    } else if (grouping === 'date') {
      label = new Date(item.createdAt).toLocaleDateString(language);
    }
    const key = unreadFirst ? `${item.isRead}:${label}` : label;
    const group = groups.get(key);
    if (group) group[1].push(item);
    else groups.set(key, [label, [item]]);
  }
  const result = [...groups.values()];
  if (unreadFirst) {
    result.sort(([, left], [, right]) =>
      Number(left[0].isRead) - Number(right[0].isRead),
    );
  }
  return result;
};
