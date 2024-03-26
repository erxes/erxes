import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src/types';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IIntegrationModel, loadIntegrationClass } from './models/Integrations';
import { IIntegrationDocument } from './models/definitions/integrations';
import { IConversationDocument } from './models/definitions/conversations';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import {
  IConversationModel,
  loadConversationClass,
} from './models/Conversations';

import { ICustomerDocument } from './models/definitions/customers';
import {
  IActiveSessionDocument,
  IActiveSessions,
} from './models/definitions/activeSessions';
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

export interface IModels {
  Integrations: IIntegrationModel;
  Conversations: IConversationModel;
  Customers: ICustomerModel;
  ActiveSessions: IActiveSessionModel;
  CallHistory: ICallHistoryModel;
  Configs: IConfigModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'calls_integrations',
    loadIntegrationClass(models),
  );

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'calls_conversations',
    loadConversationClass(models),
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'calls_customers',
    loadCustomerClass(models),
  );
  models.ActiveSessions = db.model<IActiveSessionDocument, IActiveSessionModel>(
    'calls_active_sessions',
    loadActiveSessionClass(models),
  );
  models.CallHistory = db.model<ICallHistoryDocument, ICallHistoryModel>(
    'calls_history',
    loadCallHistoryClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'calls_configs',
    loadConfigClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
