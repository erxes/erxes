import { NOTIFICATION_MODULES } from '../../constants';
import { moduleRequireLogin } from '@erxes/api-utils/src/permissions';
import { paginate } from '@erxes/api-utils/src';
import { IContext } from '../../connectionResolver';
const notificationQueries = {
  /**
   * Notifications list
   */
  notifications(
    _root,
    {
      requireRead,
      title,
      limit,
      notifType,
      startDate,
      endDate,
      ...params
    }: {
      requireRead: boolean;
      title: string;
      limit: number;
      notifType: string;
      page: number;
      perPage: number;
      startDate: string;
      endDate: string;
    },
    { models, subdomain, user }: IContext
  ) {
    const sort = { date: -1 };

    const selector: any = { receiver: user._id };

    if (requireRead) {
      selector.isRead = false;
    }

    if (title) {
      selector.title = title;
    }

    if (notifType) {
      selector.notifType = notifType;
    }

    if (startDate && endDate) {
      selector.date = {
        $gte: startDate,
        $lt: endDate
      };
    }

    if (limit) {
      return models.Notifications.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(models.Notifications.find(selector), params).sort(sort);
  },

  /**
   * Notification counts
   */
  notificationCounts(
    _root,
    { requireRead, notifType }: { requireRead: boolean; notifType: string },
    { user, models }: IContext
  ) {
    const selector: any = { receiver: user._id };

    if (requireRead) {
      selector.isRead = false;
    }

    if (notifType) {
      selector.notifType = notifType;
    }

    return models.Notifications.find(selector).countDocuments();
  },

  /**
   * Module list used in notifications
   */
  notificationsModules() {
    return NOTIFICATION_MODULES;
  },

  /**
   * Get per user configuration
   */
  notificationsGetConfigurations(_root, _args, { user, models }: IContext) {
    return models.NotificationConfigurations.find({ user: user._id });
  }
};

moduleRequireLogin(notificationQueries);

export default notificationQueries;
