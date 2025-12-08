import { Model } from 'mongoose';

import { INotificationDocument } from '@/portal/@types/notification';
import { IModels } from '~/connectionResolvers';
import { INotification } from '@/portal/@types/notification';
import { notificationSchema } from '@/portal/db/definitions/notification';

export interface INotificationModel extends Model<INotificationDocument> {
  markAsRead(ids: string[], userId?: string): void;
  createNotification(
    doc: INotification,
    createdUser?: string,
  ): Promise<INotificationDocument>;
  updateNotification(
    _id: string,
    doc: INotification,
  ): Promise<INotificationDocument>;
  checkIfRead(userId: string, contentTypeId: string): Promise<boolean>;
  removeNotification(_id: string, receiver: string): void;
}

export const loadNotificationClass = (models: IModels) => {
  class Notification {
    /**
     * Marks notifications as read
     */
    public static markAsRead(ids: string[], userId: string) {
      let selector: any = { receiver: userId };

      if (ids && ids.length > 0) {
        selector = { _id: { $in: ids } };
      }

      return models.Notifications.updateMany(selector, {
        $set: { isRead: true },
      });
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
      createdUserId: string,
    ) {
      // if receiver is configured to get this notification
      const user = await models.Users.getUser({
        _id: doc.receiver,
      });

      const config = user.notificationSettings.configs.find(
        (c) => c.notifType === doc.notifType,
      );

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
    public static removeNotification(_id: string, receiver: string) {
      return models.Notifications.deleteOne({ _id, receiver });
    }
  }

  notificationSchema.loadClass(Notification);

  return notificationSchema;
};
