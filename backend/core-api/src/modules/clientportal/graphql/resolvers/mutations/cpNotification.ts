import { checkPermission } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { notificationService } from '@/clientportal/services';

interface CPNotificationSendInput {
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  kind?: 'SYSTEM' | 'USER';
}

export const cpNotificationMutations: Record<string, Resolver> = {
  async clientPortalSendNotification(
    _root: unknown,
    {
      cpUserId,
      clientPortalId,
      input,
    }: {
      cpUserId: string;
      clientPortalId: string;
      input: CPNotificationSendInput;
    },
    { models, subdomain }: IContext,
  ) {
    const clientPortal = await models.ClientPortal.findOne({
      _id: clientPortalId,
    });
    if (!clientPortal) {
      throw new Error('Client portal not found');
    }

    const cpUser = await models.CPUser.findOne({ _id: cpUserId });
    if (!cpUser) {
      throw new Error('Client portal user not found');
    }

    const notification = await notificationService.sendNotification(
      subdomain,
      models,
      clientPortal,
      cpUser,
      {
        title: input.title,
        message: input.message,
        type: input.type?.toLowerCase() as
          | 'info'
          | 'success'
          | 'warning'
          | 'error'
          | undefined,
        priority: input.priority?.toLowerCase() as
          | 'low'
          | 'medium'
          | 'high'
          | 'urgent'
          | undefined,
        kind: (input.kind ?? 'USER').toLowerCase() as 'system' | 'user',
      },
    );

    return notification;
  },

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

cpNotificationMutations.clientPortalMarkNotificationAsRead.wrapperConfig = {
  forClientPortal: true,
};
cpNotificationMutations.clientPortalMarkAllNotificationsAsRead.wrapperConfig = {
  forClientPortal: true,
};

checkPermission(
  cpNotificationMutations,
  'clientPortalSendNotification',
  'manageClientPortalUsers',
);
