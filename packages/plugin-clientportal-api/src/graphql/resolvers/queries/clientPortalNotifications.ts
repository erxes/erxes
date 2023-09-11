// TODO: check if related stages are selected in client portal config
import { paginate } from '@erxes/api-utils/src';

import { IContext } from '../../../connectionResolver';

const notificationQueries = {
  async clientPortalNotificationCount(
    _root,
    { all }: { all: boolean },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    let qry: { receiver: string; isRead?: boolean } = {
      receiver: cpUser._id,
      isRead: false
    };

    if (all) {
      delete qry.isRead;
    }

    return models.ClientPortalNotifications.find(qry).countDocuments();
  },

  async clientPortalNotifications(
    _root,
    { page, perPage, requireRead, notifType, search, startDate, endDate },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    const query: any = {
      receiver: cpUser._id
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
        $gte: new Date(startDate)
      };
    }

    if (endDate) {
      query.createdAt = {
        $lte: new Date(endDate)
      };
    }

    return paginate(
      models.ClientPortalNotifications.find(query).sort({ createdAt: -1 }),
      {
        page,
        perPage
      }
    );
  },

  async clientPortalNotificationDetail(
    _root,
    { _id },
    { models, cpUser }: IContext
  ) {
    if (!cpUser) {
      throw new Error('You are not logged in');
    }

    const notification = await models.ClientPortalNotifications.findOne({
      _id,
      receiver: cpUser._id
    });

    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  }
};

export default notificationQueries;
