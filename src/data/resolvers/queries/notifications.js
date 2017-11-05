import { NOTIFICATION_MODULES } from '../../constants';
import { moduleRequireLogin } from '../../permissions';
import { NotificationConfigurations } from '../../../db/models';

const notificationQueries = {
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
