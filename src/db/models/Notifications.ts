import { Model, model } from 'mongoose';
import {
  configSchema,
  IConfigDocument,
  INotification,
  INotificationDocument,
  notificationSchema,
} from './definitions/notifications';
import { IUserDocument } from './definitions/users';

interface INotificationModel extends Model<INotificationDocument> {
  markAsRead(ids: string[], userId?: string): void;

  createNotification(doc: INotification, createdUser?: IUserDocument | string): Promise<INotificationDocument>;

  updateNotification(_id: string, doc: INotification): Promise<INotificationDocument>;

  removeNotification(_id: string): void;
}

class Notification {
  /**
   * Marks notifications as read
   */
  public static markAsRead(ids: string[], userId: string) {
    let selector: any = { receiver: userId };

    if (ids) {
      selector = { _id: { $in: ids } };
    }

    return Notifications.update(selector, { $set: { isRead: true } }, { multi: true });
  }

  /**
   * Create a notification
   */
  public static async createNotification(doc: INotification, createdUser?: IUserDocument | string) {
    if (!createdUser) {
      throw new Error('createdUser must be supplied');
    }

    // if receiver is configured to get this notification
    const config = await NotificationConfigurations.findOne({
      user: doc.receiver,
      notifType: doc.notifType,
    });

    // receiver disabled this notification
    if (config && !config.isAllowed) {
      throw new Error('Configuration does not exist');
    }

    return Notifications.create({ ...doc, createdUser });
  }

  /**
   * Update a notification
   */
  public static async updateNotification(_id: string, doc: INotification) {
    await Notifications.update({ _id }, doc);

    return Notifications.findOne({ _id });
  }

  /**
   * Remove a notification
   */
  public static removeNotification(_id: string) {
    return Notifications.remove({ _id });
  }
}

notificationSchema.loadClass(Notification);

export const Notifications = model<INotificationDocument, INotificationModel>('notifications', notificationSchema);

interface IConfigModel extends Model<IConfigDocument> {
  createOrUpdateConfiguration(
    { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
    user?: IUserDocument | string,
  ): Promise<IConfigDocument>;
}

class Configuration {
  /**
   * Creates an new notification or updates already existing notification configuration
   */
  public static async createOrUpdateConfiguration(
    { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
    user?: IUserDocument | string,
  ) {
    if (!user) {
      throw new Error('user must be supplied');
    }

    const selector: any = { user, notifType };

    const oldOne = await NotificationConfigurations.findOne(selector);

    // If already inserted then raise error
    if (oldOne) {
      await NotificationConfigurations.update({ _id: oldOne._id }, { $set: { isAllowed } });

      return NotificationConfigurations.findOne({ _id: oldOne._id });
    }

    // If it is first time then insert
    selector.isAllowed = isAllowed;

    return NotificationConfigurations.create(selector);
  }
}

configSchema.loadClass(Configuration);

export const NotificationConfigurations = model<IConfigDocument, IConfigModel>('notification_configs', configSchema);
