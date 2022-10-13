import * as mongoose from 'mongoose';
import {
  ICustomerDocument,
  IIntegrationDocument,
  IMessageDocument,
  ICustomerModel,
  IIntegrationModel,
  IMessageModel,
  loadCustomerClass,
  loadIntegrationClass,
  loadMessageClass,
  ILogModel,
  ILogDocument,
  loadLogClass
} from './models';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Customers: ICustomerModel;
  Integrations: IIntegrationModel;
  Messages: IMessageModel;
  Logs: ILogModel;
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

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'imap_customers',
    loadCustomerClass(models)
  );

  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'imap_integrations',
    loadIntegrationClass(models)
  );

  models.Messages = db.model<IMessageDocument, IMessageModel>(
    'imap_messages',
    loadMessageClass(models)
  );

  models.Logs = db.model<ILogDocument, ILogModel>(
    'imap_logs',
    loadLogClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
