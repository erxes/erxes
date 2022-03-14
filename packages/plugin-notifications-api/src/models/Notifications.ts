import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import {
  configSchema,
  IConfigDocument,
  INotification,
  INotificationDocument,
  notificationSchema,
} from './definitions/notifications';

export interface INotificationModel extends Model<INotificationDocument> {
  markAsRead(ids: string[], userId?: string): void;
  createNotification(
    doc: INotification,
    createdUser?: IUserDocument | string
  ): Promise<INotificationDocument>;
  updateNotification(
    _id: string,
    doc: INotification
  ): Promise<INotificationDocument>;
  checkIfRead(userId: string, contentTypeId: string): Promise<boolean>;
  removeNotification(_id: string): void;
}

export const loadNotificationClass = (models) => {
  class Notification {
    /**
     * Marks notifications as read
     */
    public static markAsRead(ids: string[], userId: string) {
      let selector: any = { receiver: userId };

      if (ids && ids.length > 0) {
        selector = { _id: { $in: ids } };
      }

      return models.Notifications.updateMany(
        selector,
        { $set: { isRead: true } },
        { multi: true }
      );
    }

    /**
     * Check if user has read notification
     */
    public static async checkIfRead(userId, contentTypeId) {
      const notification = await models.Notifications.findOne({
        isRead: false,
        receiver: userId,
        contentTypeId,
      });

      return notification ? false : true;
    }

    /**
     * Create a notification
     */
    public static async createNotification(
      doc: INotification,
      createdUserId: string
    ) {
      // if receiver is configured to get this notification
      const config = await models.NotificationConfigurations.findOne({
        user: doc.receiver,
        notifType: doc.notifType,
      });

      // receiver disabled this notification
      if (config && !config.isAllowed) {
        throw new Error('Configuration does not exist');
      }

      return models.Notifications.create({
        ...doc,
        createdUser: createdUserId,
      });
    }

    /**
     * Update a notification
     */
    public static async updateNotification(_id: string, doc: INotification) {
      await models.Notifications.updateOne({ _id }, doc);

      return models.Notifications.findOne({ _id });
    }

    /**
     * Remove a notification
     */
    public static removeNotification(_id: string) {
      return models.Notifications.deleteOne({ _id });
    }
  }

  notificationSchema.loadClass(Notification);

  return notificationSchema;
};

export interface IConfigModel extends Model<IConfigDocument> {
  createOrUpdateConfiguration(
    { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
    user?: IUserDocument | string
  ): Promise<IConfigDocument>;
}

export const loadNotificationConfigClass = (models) => {
  class Configuration {
    /**
     * Creates an new notification or updates already existing notification configuration
     */
    public static async createOrUpdateConfiguration(
      { notifType, isAllowed }: { notifType?: string; isAllowed?: boolean },
      user?: IUserDocument | string
    ) {
      const selector: any = { user, notifType };

      const oldOne = await models.NotificationConfigurations.findOne(selector);

      // If already inserted then raise error
      if (oldOne) {
        await models.NotificationConfigurations.updateOne(
          { _id: oldOne._id },
          { $set: { isAllowed } }
        );

        return models.NotificationConfigurations.findOne({ _id: oldOne._id });
      }

      // If it is first time then insert
      selector.isAllowed = isAllowed;

      return models.NotificationConfigurations.create(selector);
    }
  }

  configSchema.loadClass(Configuration);

  return configSchema;
};
