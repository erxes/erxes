import { NotificationConfigurations, Notifications } from '../../../db/models';

export default {
  /**
   * Save notification configuration
   * @param {Object}
   * @param {String.notifType} args.notifType
   * @param {String.isAllowed} args.isAllowed
   * @param {String.user} args.user
   * @return {Promise} returns notification promise
   * @throws {Error} apollo level error based on validation
   */
  notificationsSaveConfig(root, doc) {
    return NotificationConfigurations.createOrUpdateConfiguration(doc);
  },

  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} args.ids
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   */
  notificationsMarkAsRead(root, { ids }) {
    return Notifications.markAsRead(ids);
  },
};
