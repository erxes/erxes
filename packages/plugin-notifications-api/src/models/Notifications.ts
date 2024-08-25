import { IUserDocument } from '@erxes/api-utils/src/types';
import { Model } from 'mongoose';
import {
  configSchema,
  IConfig,
  IConfigDocument,
  INotification,
  INotificationDocument,
  notificationSchema
} from './definitions/notifications';
import { IModels } from '../connectionResolver';
import { can } from '@erxes/api-utils/src';

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
        contentTypeId
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
      // receiver disabled this notification if receiver is configured to get this notification
      if (
        await models.NotificationConfigurations.exists({
          user: doc.receiver,
          'pluginsConfigs.isDisabled': { $ne: true },
          'pluginsConfigs.actions.isDisabled': { $ne: true },
          'pluginsConfigs.actions.notifType': doc.notifType
        })
      ) {
        throw new Error('Configuration does not exist');
      }

      return models.Notifications.create({
        ...doc,
        createdUser: createdUserId
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
    doc: IConfig,
    user?: IUserDocument
  ): Promise<IConfigDocument>;
  setAsDefault(user?: IUserDocument): Promise<{ status: string }>;
}

export const loadNotificationConfigClass = (
  models: IModels,
  subdomain: string
) => {
  class Configuration {
    /**
     * Creates an new notification or updates already existing notification configuration
     */
    public static async createOrUpdateConfiguration(
      doc: IConfig,
      user?: IUserDocument
    ) {
      if (doc.isDefault) {
        if (!(await can(subdomain, 'setNotification', user))) {
          throw new Error('Permission denied');
        }
      }
      const selector = doc.isDefault
        ? { isDefault: true }
        : { userId: user?._id };

      const config = await models.NotificationConfigurations.findOne(selector);

      if (!config) {
        return await models.NotificationConfigurations.create({
          ...doc,
          userId: user?._id,
          isDefault: doc.isDefault
        });
      }
      return await models.NotificationConfigurations.updateOne(selector, {
        $set: { ...doc }
      });
    }

    public static async setAsDefault(user?: IUserDocument) {
      const defaultConfig = await models.NotificationConfigurations.findOne({
        isDefault: true
      }).lean();

      const selector = { userId: user?._id };

      const userConfig =
        await models.NotificationConfigurations.findOne(selector);

      if (!userConfig) {
        return { status: 'success' };
      }

      if (!defaultConfig) {
        await models.NotificationConfigurations.deleteOne(selector);
        return { status: 'success' };
      }

      const {
        isDefault,
        isDisabled,
        isAllowEmail,
        isAllowedDesktop,
        pluginsConfigs
      } = defaultConfig;

      await models.NotificationConfigurations.updateOne(selector, {
        $set: {
          isDefault,
          isDisabled,
          isAllowEmail,
          isAllowedDesktop,
          pluginsConfigs
        }
      });

      return { status: 'success' };
    }
  }

  configSchema.loadClass(Configuration);

  return configSchema;
};
