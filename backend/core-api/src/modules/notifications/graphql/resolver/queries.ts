import {
  IEmailDeliveryDocument,
  INotificationDocument,
} from 'erxes-api-shared/core-modules';
import { ICursorPaginateParams } from 'erxes-api-shared/core-types';
import {
  cursorPaginate,
  escapeRegExp,
  getPlugin,
  getPlugins,
} from 'erxes-api-shared/utils';
import { FilterQuery } from 'mongoose';
import { IContext } from '~/connectionResolvers';
import { CORE_NOTIFICATION_MODULES } from '~/modules/notifications/constants';
import { generateNotificationsFilter } from '~/modules/notifications/graphql/resolver/utils';

const generateOrderByNotifications = (orderBy?: any) => {
  const sort: any = { isRead: 1, createdAt: -1 };

  if (orderBy?.createdAt === 1) {
    sort.createdAt = 1;
  }

  if (orderBy?.priority) {
    sort.priorityLevel = orderBy.priority;
  }

  if (orderBy?.readAt) {
    sort.readAt = orderBy?.readAt;
  }

  return sort;
};

export const notificationQueries = {
  /**
   * Sent mail, newest first. The list view asks for a handful of fields; the
   * bodies and raw provider responses only come out through
   * `emailDeliveryDetail`.
   */
  async emailDeliveries(
    _root: undefined,
    params: {
      status?: string;
      source?: string;
      provider?: string;
      searchValue?: string;
      createdAtFrom?: Date;
      createdAtTo?: Date;
    } & ICursorPaginateParams,
    { models }: IContext,
  ) {
    const {
      status,
      source,
      provider,
      searchValue,
      createdAtFrom,
      createdAtTo,
    } = params;

    const query: FilterQuery<IEmailDeliveryDocument> = {};

    if (createdAtFrom || createdAtTo) {
      query.createdAt = {
        ...(createdAtFrom ? { $gte: createdAtFrom } : {}),
        ...(createdAtTo ? { $lte: createdAtTo } : {}),
      };
    }

    if (status) {
      query.status = status;
    }

    if (source) {
      query.source = source;
    }

    if (provider) {
      query.provider = provider;
    }

    if (searchValue) {
      const pattern = new RegExp(escapeRegExp(searchValue), 'i');

      query.$or = [{ toEmails: pattern }, { subject: pattern }];
    }

    return await cursorPaginate({
      model: models.EmailDeliveries,
      params: { ...params, orderBy: { createdAt: -1 } },
      query,
    });
  },

  async emailDeliveryDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    return await models.EmailDeliveries.findOne({ _id });
  },

  async pluginsNotifications() {
    const plugins = await getPlugins();

    const pluginsNotifications: Array<{
      pluginName: string;
      modules: Array<{
        name: string;
        description: string;
        icon: string;
        events: Array<{ name: string; title: string; description: string }>;
      }>;
    }> = [...CORE_NOTIFICATION_MODULES];

    for (const pluginName of plugins) {
      const plugin = await getPlugin(pluginName);
      const meta = plugin.config?.meta || {};

      if (meta?.notifications) {
        const notificationModules = meta.notifications?.modules || [];

        pluginsNotifications.push({
          pluginName,
          modules: notificationModules,
        });
      }
    }

    return pluginsNotifications;
  },

  async notifications(
    _root: undefined,
    params: any,
    { models, user }: IContext,
  ) {
    const filter = generateNotificationsFilter(params);

    let prioritized: INotificationDocument[] = [];

    if (params?.ids?.length) {
      const idsCount = params.ids.length;
      params.limit -= idsCount;
      prioritized = await models.Notifications.find({
        _id: { $in: params.ids },
        userId: user._id,
      });
    }

    const { list, totalCount, pageInfo } =
      await cursorPaginate<INotificationDocument>({
        model: models.Notifications,
        params: {
          ...params,
          orderBy: generateOrderByNotifications(params?.orderBy),
        },
        query: { ...filter, userId: user._id, isArchived: { $ne: true } },
      });

    return {
      list: [...prioritized, ...list],
      totalCount: totalCount + (params?.ids?.length || 0),
      pageInfo,
    };
  },

  async notificationDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models }: IContext,
  ) {
    const notification = await models.Notifications.findOne({ _id });
    if (!notification) {
      throw new Error('Not found notification');
    }
    return notification;
  },

  async unreadNotificationsCount(
    _root: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    return await models.Notifications.countDocuments({
      userId: user._id,
      isRead: false,
      isArchived: { $ne: true },
    });
  },

  async notificationSettings(
    _root: undefined,
    _args: undefined,
    { models, user }: IContext,
  ) {
    return models.NotificationSettings.findOne({ userId: user._id }).lean();
  },
};
