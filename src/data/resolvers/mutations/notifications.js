import { NotificationConfigurations, Notifications } from '../../../db/models';
import { moduleRequireLogin } from '../../permissions';
import { pubsub } from '../subscriptions';

const notificationMutations = {
  /**
   * Save notification configuration
   * @param {Object} object
   * @param {Object} object2 - NotificationConfiguration object
   * @param {string} object2.notifType - Notification configuration notification type (module)
   * @param {Boolean} object2.isAllowed - Shows whether notifications will be received or not
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise} return Promise resolving a Notification document
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  notificationsSaveConfig(root, doc, { user }) {
    return NotificationConfigurations.createOrUpdateConfiguration(doc, user);
  },

  /**
   * Marks notification as read
   * @param {Object}
   * @param {Object} object2 - Graphql input data
   * @param {string} object2.ids - Notification ids
   * @param {Object} object3 - Middleware data
   * @param {Object} object3.user - The user making this action
   * @return {Promise}
   * @throws {Error} throws Error('Login required') if user is not logged in
   */
  notificationsMarkAsRead(root, { _ids }, { user }) {
    // notify subscription
    pubsub.publish('notificationsChanged');

    return Notifications.markAsRead(_ids, user._id);
  },
};

moduleRequireLogin(notificationMutations);

export default notificationMutations;
