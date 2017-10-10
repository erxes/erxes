import { Notifications } from '../../../db/models';

export default {
  notificationsCreate(root, doc) {
    return Notifications.createNotification(doc);
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
