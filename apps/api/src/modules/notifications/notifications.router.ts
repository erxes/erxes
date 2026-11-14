import { db } from '@erxes/core-db';
import {
  listNotifications,
  markRead,
  removeNotification,
  unreadCount,
} from '~/modules/notifications/inbox.service';
import { notify } from '~/modules/notifications/notifications.service';
import {
  notificationSettings,
  updateNotificationSettings,
} from '~/modules/notifications/settings.service';
import { scoped } from '~/orpc';

export const notificationsRouter = {
  list: scoped.notifications.list.handler(({ input }) => listNotifications(db(), input)),
  unreadCount: scoped.notifications.unreadCount.handler(({ input }) =>
    unreadCount(db(), input.source),
  ),
  settings: scoped.notifications.settings.handler(() => notificationSettings(db())),
  updateSettings: scoped.notifications.updateSettings.handler(({ input }) =>
    updateNotificationSettings(db(), input),
  ),
  markRead: scoped.notifications.markRead.handler(({ input }) => markRead(db(), input)),
  remove: scoped.notifications.remove.handler(({ input }) => removeNotification(db(), input.id)),
  create: scoped.notifications.create.handler(({ input }) => notify(db(), input)),
};
