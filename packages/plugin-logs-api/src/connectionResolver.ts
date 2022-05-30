import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';

import {
  IActivityLogModel,
  IActivityLogDocument,
  loadClass as loadActivityLogClass
} from './models/ActivityLogs';
import { ILogModel, ILogDocument, loadLogClass } from './models/Logs';
import {
  IVisitorModel,
  IVisitorDocument,
  loadVisitorClass
} from './models/Visitors';
import {
  IEmailDeliveriesDocument,
  IEmailDeliveryModel,
  loadEmailDeliveryClass
} from './models/EmailDeliveries';
import { createGenerateModels } from '@erxes/api-utils/src/core';

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

export let models: IModels | null = null;

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string
): IModels => {
  models = {} as IModels;

  models.ActivityLogs = db.model<IActivityLogDocument, IActivityLogModel>(
    'activity_logs',
    loadActivityLogClass(models, subdomain)
  );

  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models));

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

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
