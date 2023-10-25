import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';

import {
  IConfigDocument,
  IConfigModel,
  loadConfigClass
} from './models/Configs';
import {
  IDeliveryReportModel,
  IDeliveryReportsDocument,
  IStatsDocument,
  IStatsModel,
  loadStatsClass,
  deliveryReportsSchema
} from './models/DeliveryReports';
import { IEngageMessageModel, loadEngageMessageClass } from './models/Engages';
import { ILogDocument, ILogModel, loadLogClass } from './models/Logs';
import {
  ISmsRequestDocument,
  ISmsRequestModel,
  loadSmsRequestClass
} from './models/SmsRequests';
import {
  IEngageMessageDocument,
  verifiedEmailAddressesSchema
} from './models/definitions/engages';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { Model, Document } from 'mongoose';

export interface IModels {
  Configs: IConfigModel;
  DeliveryReports: IDeliveryReportModel;
  EngageMessages: IEngageMessageModel;
  Logs: ILogModel;
  SmsRequests: ISmsRequestModel;
  Stats: IStatsModel;
  VerifiedAddresses: Model<
    { _id: string; mailServiceName: string; email: string } & Document
  >;
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

  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models)
  );
  models.EngageMessages = db.model<IEngageMessageDocument, IEngageMessageModel>(
    'engage_messages',
    loadEngageMessageClass(models, subdomain)
  );
  models.DeliveryReports = db.model<
    IDeliveryReportsDocument,
    IDeliveryReportModel
  >('delivery_reports', deliveryReportsSchema);
  models.Stats = db.model<IStatsDocument, IStatsModel>(
    'engage_stats',
    loadStatsClass(models)
  );
  models.SmsRequests = db.model<ISmsRequestDocument, ISmsRequestModel>(
    'engage_sms_requests',
    loadSmsRequestClass(models, subdomain)
  );
  models.Logs = db.model<ILogDocument, ILogModel>(
    'engage_logs',
    loadLogClass(models, subdomain)
  );
  models.VerifiedAddresses = db.model<any, Model<any>>(
    'engage_verified_addresses',
    verifiedEmailAddressesSchema
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
