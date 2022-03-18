import { MongoClient } from 'mongodb';
import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import { mainDb } from './configs';
import { IConfigDocument, IConfigModel, loadConfigClass } from './models/Configs';
import { IDeliveryReportModel, IDeliveryReportsDocument, IStatsDocument, IStatsModel, loadStatsClass } from './models/DeliveryReports';
import { IEngageMessageModel, loadEngageMessageClass } from './models/Engages';
import { ILogDocument, ILogModel, loadLogClass } from './models/Logs';
import { ISmsRequestDocument, ISmsRequestModel, loadSmsRequestClass } from './models/SmsRequests';
import { IEngageMessageDocument } from './models/definitions/engages';

export interface ICoreIModels {
  Users;
}

export interface IModels {
  Configs: IConfigModel;
  DeliveryReports: IDeliveryReportModel;
  EngageMessages: IEngageMessageModel;
  Logs: ILogModel;
  SmsRequests: ISmsRequestModel;
  Stats: IStatsModel
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  coreModels: ICoreIModels;
}

export let models: IModels;
export let coreModels: ICoreIModels;

export const getSubdomain = (hostname: string): string => {
  return hostname.replace(/(^\w+:|^)\/\//, '').split('.')[0];
};

export const generateCoreModels = async (
  _hostnameOrSubdomain: string
): Promise<ICoreIModels> => {
  return coreModels;
};

export const generateModels = async (
  hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  coreModels = await connectCore();

  loadClasses(mainDb, hostnameOrSubdomain);

  return models;
};

export const connectCore = async () => {
  if(coreModels) { return coreModels; }

  const url = process.env.API_MONGO_URL || 'mongodb://localhost/erxes';
  const client = new MongoClient(url);

  let db;

  await client.connect();

  console.log(`Connected successfully to ${url}`);

  db = client.db();

  coreModels =  {
    Users: await db.collection('users'),
  }

  return coreModels;
}

export const loadClasses = (db: mongoose.Connection, subdomain: string): IModels => {
  models = {} as IModels;

  models.Configs = db.model<IConfigDocument, IConfigModel>('configs', loadConfigClass(models));
  models.EngageMessages = db.model<IEngageMessageDocument, IEngageMessageModel>(
    'engage_messages',
    loadEngageMessageClass(models, subdomain)
  );
  models.DeliveryReports = db.model<IDeliveryReportsDocument, IDeliveryReportModel>('delivery_reports');
  models.Stats = db.model<IStatsDocument, IStatsModel>('engage_stats', loadStatsClass(models));
  models.SmsRequests = db.model<ISmsRequestDocument, ISmsRequestModel>(
    'engage_sms_requests',
    loadSmsRequestClass(models, subdomain)
  );
  models.Logs = db.model<ILogDocument, ILogModel>('engage_logs', loadLogClass(models, subdomain));

  return models;
};
