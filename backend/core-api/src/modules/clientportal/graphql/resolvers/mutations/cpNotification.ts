import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { markResolvers } from 'erxes-api-shared/utils';

export const cpNotificationMutations: Record<string, Resolver> = {
  async clientPortalMarkNotificationAsRead(
    _root: unknown,
    { _id }: { _id: string },
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const notification = await models.CPNotifications.findOneAndUpdate(
      { _id, cpUserId: cpUser._id },
      { $set: { isRead: true, readAt: new Date() } },
      { new: true },
    );

    if (!notification) {
      throw new Error('Notification not found');
    }

    return { success: true };
  },

  async clientPortalMarkAllNotificationsAsRead(
    _root: unknown,
    { clientPortalId }: { clientPortalId?: string },
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const query: any = {
      cpUserId: cpUser._id,
      isRead: false,
    };

    if (clientPortalId) {
      query.clientPortalId = clientPortalId;
    }

    await models.CPNotifications.updateMany(query, {
      $set: { isRead: true, readAt: new Date() },
    });

    return { success: true };
  },
};

markResolvers(cpNotificationMutations, {
  wrapperConfig: {
    forClientPortal: true,
  },
});
