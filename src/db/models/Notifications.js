import mongoose from 'mongoose';

// schemas
const NotificationSchema = new mongoose.Schema({
  notifType: String,
  title: String,
  link: String,
  content: String,
  createdUser: String,
  receiver: String,
  date: Date,
  isRead: Boolean,
});

class Notification {
  static markAsRead(ids) {
    return this.update({ _id: { $in: ids } }, { $set: { isRead: true } }, { multi: true });
  }

  static async createNotification({ createdUser, ...doc }) {
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

  static updateNotification(_id, doc) {
    return this.update({ _id }, doc);
  }

  static removeNotification(_id) {
    return this.remove({ _id });
  }
}

NotificationSchema.loadClass(Notification);
export const Notifications = mongoose.model('notifications', NotificationSchema);

const ConfigSchema = new mongoose.Schema({
  // to whom this config is related
  user: String,
  notifType: String,
  isAllowed: Boolean,
});

class Configuration {
  static async createOrUpdateConfiguration({ notifType, isAllowed, user }) {
    const selector = { user, notifType };

    const oldOne = await this.findOne(selector);

    // If already inserted then raise error
    if (oldOne) {
      await this.update({ _id: oldOne._id }, { $set: { isAllowed } });
      return await this.findOne({ _id: oldOne._id });
    }

    // If it is first time then insert
    selector.isAllowed = isAllowed;
    return await this.create(selector);
  }
}

ConfigSchema.loadClass(Configuration);
export const NotificationConfigurations = mongoose.model('notification_configs', ConfigSchema);
