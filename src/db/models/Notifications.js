import mongoose from 'mongoose';
import Random from 'meteor-random';
import { MODULE_LIST } from '../../data/constants';

// Notification schema
const NotificationSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  notifType: {
    type: String,
    enum: MODULE_LIST,
  },
  title: String,
  link: String,
  content: String,
  createdUser: String,
  receiver: String,
  date: {
    type: Date,
    default: Date.now,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
});

class Notification {
  /**
   * Marks notifications as read
   * @param {String[]} ids - Notification ids
   * @return {Promise}
   */
  static markAsRead(ids) {
    return this.update({ _id: { $in: ids } }, { $set: { isRead: true } }, { multi: true });
  }

  /**
   * Create a notification
   * @param {Object} doc - Notification object
   * @param {string} doc.notifType - Category of notification  (module)
   * @param {string} doc.title - Notificaton title
   * @param {string} doc.content - Notification content
   * @param {string} doc.link - Notification link
   * @param {Object|string} doc.receiver - Id of the user that will receive this notification
   * @param {Object|string} createdUser - The user whose actions made this notification
   * @return {Notification} Notification Object
   * @throws {Exception} throws Exception if createdUser is not supplied
   */
  static async createNotification(doc, createdUser) {
    if (!createdUser) {
      throw new Error('createdUser must be supplied');
    }

    // Setting auto values
    doc.createdUser = createdUser;

    // if receiver is configured to get this notification
    const config = await NotificationConfigurations.findOne({
      user: doc.receiver,
      notifType: doc.notifType,
    });

    // receiver disabled this notification
    if (config && !config.isAllowed) {
      throw new Error('Configuration does not exist');
    }

    return await this.create(doc);
  }

  /**
   * Update a notification
   * @param {string} _id - Id of notification
   * @param {Object} doc - Notification object
   * @param {string} doc.notifType - Category of notification  (module)
   * @param {string} doc.createdUser - The user whose actions made this notification
   * @param {string} doc.title - Notificaton title
   * @param {string} doc.content - Notification content
   * @param {string} doc.link - Notification link
   * @param {Object|string} doc.receiver - Id of the user that will receive this notification
   * @return {Promise} The promise returns null
   */
  static updateNotification(_id, doc) {
    return this.update({ _id }, doc);
  }

  /**
   * Remove a notification
   * @param {string} _id - Notification id
   * @return {Promise}
   */
  static removeNotification(_id) {
    return this.remove({ _id });
  }
}

NotificationSchema.loadClass(Notification);
export const Notifications = mongoose.model('notifications', NotificationSchema);

// schema for NotificationConfigurations
const ConfigSchema = new mongoose.Schema({
  _id: {
    type: String,
    unique: true,
    default: () => Random.id(),
  },
  // to whom this config is related
  user: String,
  notifType: {
    type: String,
    enum: MODULE_LIST,
  },
  isAllowed: Boolean,
});

class Configuration {
  /**
   * Creates an new notification or updates already existing notification configuration
   * @param {object} object - NotificationConfiguration object
   * @param {string} object.notifType - NotificationType (module)
   * @param {Boolean} object.isAllowed - Indicates whether notifications
   *   will be received or not on the given channel
   * @param {Object|string} user - The object or id of the user making this action
   * @return {Promise} returns NotificationConfigurations object promise
   */
  static async createOrUpdateConfiguration({ notifType, isAllowed }, user) {
    if (!user) {
      throw new Error('user must be supplied');
    }

    const selector = { user, notifType };

    const oldOne = await this.findOne(selector);

    // If already inserted then raise error
    if (oldOne) {
      await this.update({ _id: oldOne._id }, { $set: { isAllowed } });

      return await this.findOne({ _id: oldOne._id });
    }

    // If it is first time then insert
    selector.isAllowed = isAllowed;

    return this.create(selector);
  }
}

ConfigSchema.loadClass(Configuration);
export const NotificationConfigurations = mongoose.model('notification_configs', ConfigSchema);
