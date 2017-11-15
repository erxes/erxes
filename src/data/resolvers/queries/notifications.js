import { NOTIFICATION_MODULES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { Notifications, NotificationConfigurations } from '../../../db/models';
import { paginate } from './utils';

const notificationQueries = {
  /**
   * Notifications list
   * @param {Object} args
   * @return {Promise} filtered notifications list by given parameters
   */
  notifications(root, { requireRead, title, limit, ...params }, { user }) {
    const sort = { date: -1 };
    const selector = { receiver: user._id };

    if (requireRead) {
      selector.isRead = false;
    }

    if (title) {
      selector.title = title;
    }

    if (limit) {
      return Notifications.find(selector)
        .sort(sort)
        .limit(limit);
    }

    return paginate(Notifications.find(selector), params).sort(sort);
  },

  /**
   * Notification counts
   * @return {Int} notification counts
   */
  notificationCounts(root, { requireRead }, { user }) {
    const selector = { receiver: user._id };

    if (requireRead) {
      selector.isRead = false;
    }

    return Notifications.find(selector).count();
  },

  /**
   * Module list used in notifications
   * @param {Object} args
   * @return {String[]} returns module list
   */
  notificationsModules() {
    return NOTIFICATION_MODULES;
  },

  /**
   * Get per user configuration
   * @param {Object} args
   * @return {[Object]} - user's notification configurations
   */
  notificationsGetConfigurations(root, args, { user }) {
    return NotificationConfigurations.find({ user: user._id });
  },
};

moduleRequireLogin(notificationQueries);

export default notificationQueries;
