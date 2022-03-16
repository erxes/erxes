import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { mainDb } from './configs';
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

export interface IModels {
  Notifications: INotificationModel;
  NotificationConfigurations: IConfigModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
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
