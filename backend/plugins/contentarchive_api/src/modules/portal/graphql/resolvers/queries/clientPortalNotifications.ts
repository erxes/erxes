import { cursorPaginate } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';

const notificationQueries = {
  async clientPortalNotificationCount(
    _root,
    { all }: { all: boolean },
    { models, portalUser }: IContext,
  ) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    const qry: { receiver: string; isRead?: boolean } = {
      receiver: portalUser._id,
      isRead: false,
    };

    if (all) {
      delete qry.isRead;
    }

    return models.Notifications.find(qry).countDocuments();
  },

  async clientPortalNotifications(
    _root,
    {
      requireRead,
      notifType,
      search,
      startDate,
      endDate,
      eventDataFilter,
      ...args
    },
    { models, portalUser }: IContext,
  ) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    const query: any = {
      receiver: portalUser._id,
    };

    if (requireRead) {
      query.isRead = false;
    }

    if (notifType) {
      query.notifType = notifType;
    }

    if (search) {
      query.title = { $regex: new RegExp(`^${search}`, 'i') };
    }

    if (startDate) {
      query.createdAt = {
        $gte: new Date(startDate),
      };
    }

    if (endDate) {
      query.createdAt = {
        $lte: new Date(endDate),
      };
    }

    if (eventDataFilter) {
      const { field, values } = eventDataFilter || {};
      query[`eventData.${field}`] = { $in: values || [] };
    }

    const { list, totalCount, pageInfo } = await cursorPaginate({
      model: models.Notifications,
      params: args,
      query,
    });

    return { list, totalCount, pageInfo };
  },

  async clientPortalNotificationDetail(
    _root,
    { _id },
    { models, portalUser }: IContext,
  ) {
    if (!portalUser) {
      throw new Error('You are not logged in');
    }

    const notification = await models.Notifications.findOne({
      _id,
      receiver: portalUser._id,
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  },
};

export default notificationQueries;
