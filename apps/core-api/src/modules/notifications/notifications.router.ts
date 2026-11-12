import { db } from '@erxes/core-db';
import { pluginCaller } from '~/http/auth';
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
import { authed, plugin } from '~/orpc';

export const notificationsRouter = {
  list: authed.notifications.list.handler(({ input, context }) =>
    listNotifications(db(), context.actor, input),
  ),
  unreadCount: authed.notifications.unreadCount.handler(({ input, context }) =>
    unreadCount(db(), context.actor, input.source),
  ),
  settings: authed.notifications.settings.handler(({ context }) =>
    notificationSettings(db(), context.actor),
  ),
  updateSettings: authed.notifications.updateSettings.handler(({ input, context }) =>
    updateNotificationSettings(db(), context.actor, input),
  ),
  markRead: authed.notifications.markRead.handler(({ input, context }) =>
    markRead(db(), context.actor, input),
  ),
  remove: authed.notifications.remove.handler(({ input, context }) =>
    removeNotification(db(), context.actor, input.id),
  ),
  create: plugin.notifications.create.handler(({ input, context }) =>
    notify(db(), pluginCaller(context.plugin), input),
  ),
};
