import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';

export const cpNotificationQueries: Record<string, Resolver> = {
  async clientPortalNotifications(
    _root: unknown,
    params: {
      cursor?: string;
      limit?: number;
      status?: 'READ' | 'UNREAD' | 'ALL';
      priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
      type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
      kind?: 'SYSTEM' | 'USER';
      fromDate?: string;
      endDate?: string;
      clientPortalId?: string;
    },
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const query: any = { cpUserId: cpUser._id };

    if (params.clientPortalId) {
      query.clientPortalId = params.clientPortalId;
    }

    if (params.status && params.status !== 'ALL') {
      query.isRead = params.status === 'READ';
    }

    if (params.priority) {
      query.priority = params.priority.toLowerCase();
    }

    if (params.type) {
      query.type = params.type.toLowerCase();
    }

    if (params.kind) {
      query.kind = params.kind.toLowerCase();
    }

    if (params.fromDate || params.endDate) {
      query.createdAt = {};
      if (params.fromDate) {
        query.createdAt.$gte = new Date(params.fromDate);
      }
      if (params.endDate) {
        query.createdAt.$lte = new Date(params.endDate);
      }
    }

    const { list, totalCount, pageInfo } = await cursorPaginate<
      ICPNotificationDocument
    >({
      model: models.CPNotifications,
      params: {
        ...params,
        orderBy: { createdAt: -1 },
      },
      query,
    });

    return { list, totalCount, pageInfo };
  },

  async clientPortalNotificationDetail(
    _root: unknown,
    { _id }: { _id: string },
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const notification = await models.CPNotifications.findOne({
      _id,
      cpUserId: cpUser._id,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  },

  async clientPortalUnreadNotificationCount(
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

    return models.CPNotifications.countDocuments(query);
  },
};

cpNotificationQueries.clientPortalNotifications.wrapperConfig = {
  forClientPortal: true,
};

cpNotificationQueries.clientPortalNotificationDetail.wrapperConfig = {
  forClientPortal: true,
};

cpNotificationQueries.clientPortalUnreadNotificationCount.wrapperConfig = {
  forClientPortal: true,
};
