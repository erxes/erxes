import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { generateNotificationsFilter } from '~/modules/notifications/graphql/resolver/utils';

export const notificationMutations = {
  async archiveNotification(
    _root: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    const notification = await models.Notifications.findOne({ _id });

    if (!notification) throw new Error('Not found notification');

    if (notification.userId !== user._id)
      throw new Error('Not found notification');

    await models.Notifications.updateOne(
      { _id, userId: user._id },
      { isArchived: true },
    );

    graphqlPubsub.publish(`notificationArchived:${user._id}`, {
      notificationArchived: { userId: user._id, notificationId: _id },
    });

    return 'removed successfully';
  },

  async archiveNotifications(
    _root: undefined,
    {
      ids,
      archiveAll,
      filters,
    }: { ids: string[]; archiveAll: boolean; filters: any },
    { models, user }: IContext,
  ) {
    const selector = archiveAll
      ? { ...generateNotificationsFilter(filters) }
      : { _id: { $in: ids } };

    const notificationIds = await models.Notifications.find(
      { userId: user._id, ...selector },
      {
        _id: 1,
      },
    ).distinct('_id');

    await models.Notifications.updateMany(selector, { isArchived: true });

    graphqlPubsub.publish(`notificationArchived:${user._id}`, {
      notificationArchived: { userId: user._id, notificationIds },
    });

    return 'removed successfully';
  },

  async markNotificationAsRead(
    _root: undefined,
    { _id }: { _id: string },
    { models, user }: IContext,
  ) {
    const notification = await models.Notifications.findOne({ _id });
    if (!notification) throw new Error('Not found notification');

    if (!notification.isRead) {
      await models.Notifications.updateOne(
        { _id },
        { $set: { isRead: true, readAt: new Date() } },
      );

      graphqlPubsub.publish(`notificationRead:${user._id}`, {
        notificationRead: { userId: user._id, notificationId: _id },
      });
    }

    return { success: true };
  },

  async markAsReadNotifications(
    _root: undefined,
    { ids, ...filters }: { ids: string[]; [key: string]: any },
    { models, user }: IContext,
  ) {
    const filter = ids.length
      ? { _id: { $in: ids } }
      : generateNotificationsFilter(filters as any);

    const notificationIds = await models.Notifications.find(filter, {
      _id: 1,
    }).distinct('_id');

    await models.Notifications.updateMany(
      { ...filter, userId: user._id },
      {
        $set: { isRead: true, readAt: new Date() },
      },
    );

    graphqlPubsub.publish(`notificationRead:${user._id}`, {
      notificationRead: { userId: user._id, notificationIds },
    });

    return { success: true };
  },

  async updateNotificationSettingsEvent(
    _root: undefined,
    {
      input,
    }: { input: { event: string; enabled: boolean; channels: string[] } },
    { models, user }: IContext,
  ) {
    const { event, enabled, channels } = input;

    await models.NotificationSettings.updateOne(
      { userId: user._id },
      { $set: { [`events.${event}`]: { enabled, channels } } },
      { upsert: true },
    );

    return { success: true };
  },

  async updateNotificationSettingsChannel(
    _root: undefined,
    {
      input,
    }: {
      input: {
        channel: string;
        enabled: boolean;
        metadata?: Record<string, unknown>;
      };
    },
    { models, user }: IContext,
  ) {
    const { channel, enabled, metadata } = input;

    await models.NotificationSettings.updateOne(
      { userId: user._id },
      { $set: { [`channels.${channel}`]: { enabled, metadata } } },
      { upsert: true },
    );

    return { success: true };
  },
};
