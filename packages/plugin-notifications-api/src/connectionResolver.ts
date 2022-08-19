import * as mongoose from 'mongoose';
import {
  IConfigDocument,
  INotificationDocument,
} from './models/definitions/notifications';
import {
  IConfigModel,
  INotificationModel,
  loadNotificationClass,
  loadNotificationConfigClass,
} from './models/Notifications';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Notifications: INotificationModel;
  NotificationConfigurations: IConfigModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  _subdomain: string
): IModels => {
  models = {} as IModels;

  models.Notifications = db.model<INotificationDocument, INotificationModel>(
    'notifications',
    loadNotificationClass(models)
  );

  models.NotificationConfigurations = db.model<IConfigDocument, IConfigModel>(
    'notification_configurations',
    loadNotificationConfigClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(models, loadClasses);