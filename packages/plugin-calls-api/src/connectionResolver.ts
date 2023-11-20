import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src/types';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IIntegrationModel, loadIntegrationClass } from './models/Integrations';
import { IIntegrationDocument } from './models/definitions/integrations';
import { IConversationDocument } from './models/definitions/conversations';
import { ICustomerModel, loadCustomerClass } from './models/Customers';
import {
  IConversationModel,
  loadConversationClass
} from './models/Conversations';
import {
  IConversationMessageModel,
  loadConversationMessageClass
} from './models/ConversationMessages';
import { IConversationMessageDocument } from './models/definitions/conversationMessages';
import { ICustomerDocument } from './models/definitions/customers';

export interface IModels {
  Integrations: IIntegrationModel;
  Conversations: IConversationModel;
  Customers: ICustomerModel;
  ConversationMessages: IConversationMessageModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'calls_integrations',
    loadIntegrationClass(models)
  );

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'calls_conversations',
    loadConversationClass(models)
  );

  models.ConversationMessages = db.model<
    IConversationMessageDocument,
    IConversationMessageModel
  >('calls_conversation_messages', loadConversationMessageClass(models));

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'calls_customers',
    loadCustomerClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
