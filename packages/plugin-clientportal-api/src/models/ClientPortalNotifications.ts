import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';

import { IModels } from '../connectionResolver';
import {
  cpNotificationSchema,
  ICPNotification,
  ICPNotificationDocument
} from './definitions/clientPortalNotifications';

export interface ICPNotificationModel extends Model<ICPNotificationDocument> {
  markAsRead(ids: string[], userId?: string): void;
  createNotification(
    doc: ICPNotification,
    createdUser?: string
  ): Promise<ICPNotificationDocument>;
  updateNotification(
    _id: string,
    doc: ICPNotification
  ): Promise<ICPNotificationDocument>;
  checkIfRead(userId: string, contentTypeId: string): Promise<boolean>;
  removeNotification(_id: string, receiver: string): void;
}

export const loadNotificationClass = (models: IModels) => {
  class ClientPortalNotification {
    /**
     * Marks notifications as read
     */
    public static markAsRead(ids: string[], userId: string) {
      let selector: any = { receiver: userId };

      if (ids && ids.length > 0) {
        selector = { _id: { $in: ids } };
      }

      return models.ClientPortalNotifications.updateMany(
        selector,
        { $set: { isRead: true } },
        { multi: true }
      );
    }

    /**
     * Check if user has read notification
     */
    public static async checkIfRead(userId, contentTypeId) {
      const notification = await models.ClientPortalNotifications.findOne({
        isRead: false,
        receiver: userId,
        contentTypeId
      });

      return notification ? false : true;
    }

    /**
     * Create a notification
     */
    public static async createNotification(
      doc: ICPNotification,
      createdUserId: string
    ) {
      // if receiver is configured to get this notification
      const user = await models.ClientPortalUsers.getUser({
        _id: doc.receiver
      });

      const config = user.notificationSettings.configs.find(
        c => c.notifType === doc.notifType
      );

      // receiver disabled this notification
      if (config && !config.isAllowed) {
        throw new Error('Configuration does not exist');
      }

      return models.ClientPortalNotifications.create({
        ...doc,
        createdUser: createdUserId
      });
    }

    /**
     * Update a notification
     */
    public static async updateNotification(_id: string, doc: ICPNotification) {
      await models.ClientPortalNotifications.updateOne({ _id }, doc);

      return models.ClientPortalNotifications.findOne({ _id });
    }

    /**
     * Remove a notification
     */
    public static removeNotification(_id: string, receiver: string) {
      return models.ClientPortalNotifications.deleteOne({ _id, receiver });
    }
  }

  cpNotificationSchema.loadClass(ClientPortalNotification);

  return cpNotificationSchema;
};
