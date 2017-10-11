import { NotificationConfigurations, Notifications } from '../../../db/models';

export default {
  /**
   * Save notification configuration
   * @param {Object} args1
   * @param {String} args2.notifType
   * @param {Boolean} args2.isAllowed
   * @param {String} args3.user
   * @return {Promise} returns notification promise
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  notificationsSaveConfig(root, doc, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return NotificationConfigurations.createOrUpdateConfiguration(doc, user);
  },

  /**
   * Create a new messenger integration
   * @param {Object}
   * @param {String} args.ids
   * @return {Promise} returns the messenger integration
   * @throws {Error} apollo level error based on validation
   * @throws {Error} throws error if user is not logged in
   */
  notificationsMarkAsRead(root, { ids }, { user }) {
    if (!user) {
      throw new Error('Login required');
    }

    return Notifications.markAsRead(ids);
  },
};
