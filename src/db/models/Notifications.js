import mongoose from 'mongoose';
import Configurations from './Configurations';

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
    const config = await Configurations.findOne({
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
export default mongoose.model('notifications', NotificationSchema);
