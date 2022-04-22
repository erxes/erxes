import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';

import { mainDb } from './configs';
import {
  IActivityLogModel,
  IActivityLogDocument,
  loadClass as loadActivityLogClass,
} from './models/ActivityLogs';
import { ILogModel, ILogDocument, loadLogClass } from './models/Logs';
import { IVisitorModel, IVisitorDocument, loadVisitorClass } from './models/Visitors';
import { IEmailDeliveriesDocument, IEmailDeliveryModel, loadEmailDeliveryClass } from './models/EmailDeliveries';

export interface IModels {
  ActivityLogs: IActivityLogModel;
  Logs: ILogModel;
  Visitors: IVisitorModel;
  EmailDeliveries: IEmailDeliveryModel;
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

  models.ActivityLogs = db.model<IActivityLogDocument, IActivityLogModel>(
    'activity_logs',
    loadActivityLogClass(models, subdomain)
  );

  models.Logs = db.model<ILogDocument, ILogModel>(
    'logs',
    loadLogClass(models)
  );

  models.Visitors = db.model<IVisitorDocument, IVisitorModel>(
    'visitors',
    loadVisitorClass(models)
  );

  models.EmailDeliveries = db.model<
    IEmailDeliveriesDocument,
    IEmailDeliveryModel
  >('email_deliveries', loadEmailDeliveryClass(models));

  return models;
};
