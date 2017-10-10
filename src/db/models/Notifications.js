import mongoose from 'mongoose';
import { Configurations } from './Notifications';

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

  static createNotification({ userId, ...doc }) {
    if (!userId) {
      throw new Error('createdUserId must be supplied');
    }

    // Setting auto values
    doc.userId = userId;

    // if receiver is configured to get this notification
    const config = Configurations.findOne({
      user: doc.receiver,
      notifType: doc.notifType,
    });

    // receiver disabled this notification
    if (config && !config.isAllowed) {
      throw new Error('error');
    }

    return this.insert(doc);
  }
}

NotificationSchema.loadClass(Notification);
export default mongoose.model('notifications', NotificationSchema);
