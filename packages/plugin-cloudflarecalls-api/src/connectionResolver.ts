import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src/types';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IIntegrationModel, loadIntegrationClass } from './models/Integrations';
import { IIntegrationDocument } from './models/definitions/integrations';
import { ICustomerModel, loadCustomerClass } from './models/Customers';

import { ICustomer, ICustomerDocument } from './models/definitions/customers';
import { IActiveSessionDocument } from './models/definitions/activeSessions';
import {
  IActiveSessionModel,
  loadActiveSessionClass,
} from './models/ActiveSessions';
import { ICallHistoryDocument } from './models/definitions/callHistories';
import {
  ICallHistoryModel,
  loadCallHistoryClass,
} from './models/CallHistories';
import {
  IConfigDocument,
  IConfigModel,
  loadConfigClass,
} from './models/Configs';
import { IOperatorDocuments } from './models/definitions/operators';
import { IOperatorModel, loadOperatorClass } from './models/Operators';
export interface IModels {
  Integrations: IIntegrationModel;
  Customers: ICustomerModel;
  ActiveSessions: IActiveSessionModel;
  CallHistory: ICallHistoryModel;
  Configs: IConfigModel;
  Operators: IOperatorModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'cloudflare_calls_integrations',
    loadIntegrationClass(models),
  );
  models.Customers = db.model<ICustomer, ICustomerModel>(
    'cloudflare_calls_customers',
    loadCustomerClass(models),
  );
  models.CallHistory = db.model<ICallHistoryDocument, ICallHistoryModel>(
    'cloudflare_calls_history',
    loadCallHistoryClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'cloudflare_calls_configs',
    loadConfigClass(models),
  );
  models.Operators = db.model<IOperatorDocuments, IOperatorModel>(
    'cloudflare_calls_operators',
    loadOperatorClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
