import { checkPermission } from 'erxes-api-shared/core-modules';
import { Resolver } from 'erxes-api-shared/core-types';
import { IContext } from '~/connectionResolvers';
import { cursorPaginate } from 'erxes-api-shared/utils';
import { ICPNotificationDocument } from '@/clientportal/types/cpNotification';
import {
  buildCPNotificationQuery,
  CPNotificationFilterParams,
} from '@/clientportal/services/helpers/queryBuilders';

export const cpNotificationQueries: Record<string, Resolver> = {
  async getClientPortalNotificationsByCpUserId(
    _root: unknown,
    params: {
      cpUserId: string;
      cursor?: string;
      limit?: number;
    } & CPNotificationFilterParams,
    { models }: IContext,
  ) {
    const query = buildCPNotificationQuery(
      { cpUserId: params.cpUserId },
      params,
    );

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICPNotificationDocument>({
        model: models.CPNotifications,
        params: {
          ...params,
          orderBy: { createdAt: -1 },
        },
        query,
      });

    return { list, totalCount, pageInfo };
  },

  async clientPortalNotifications(
    _root: unknown,
    params: {
      cursor?: string;
      limit?: number;
    } & CPNotificationFilterParams,
    { models, cpUser }: IContext,
  ) {
    if (!cpUser) {
      throw new Error('User is not logged in');
    }

    const query = buildCPNotificationQuery({ cpUserId: cpUser._id }, params);

    const { list, totalCount, pageInfo } =
      await cursorPaginate<ICPNotificationDocument>({
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

checkPermission(
  cpNotificationQueries,
  'getClientPortalNotificationsByCpUserId',
  'showClientPortalUsers',
);
