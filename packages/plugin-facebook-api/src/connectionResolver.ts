import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import { ICommentModel, loadCommentClass } from './models/Comments';
import { ICommentDocument } from './models/definitions/comments';

import {
  IConversationModel,
  loadConversationClass
} from './models/Conversations';
import { IConversationDocument } from './models/definitions/conversations';

import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';

import { IPostModel, loadPostClass } from './models/Posts';
import { IPostDocument } from './models/definitions/posts';

import { IConversationMessageDocument } from './models/definitions/conversationMessages';
import {
  IConversationMessageModel,
  loadConversationMessageClass
} from './models/ConversationMessages';
import {
  IAccountDocument,
  IAccountModel,
  loadAccountClass
} from './models/Accounts';
import {
  IConfigDocument,
  IConfigModel,
  loadConfigClass
} from './models/Configs';
import {
  IIntegrationDocument,
  IIntegrationModel,
  loadIntegrationClass
} from './models/Integrations';
import { ILogModel, loadLogClass } from './models/Logs';
import { ILogDocument } from './models/definitions/logs';

export interface IModels {
  Comments: ICommentModel;
  Conversations: IConversationModel;
  Customers: ICustomerModel;
  Posts: IPostModel;
  ConversationMessages: IConversationMessageModel;
  Accounts: IAccountModel;
  Configs: IConfigModel;
  Integrations: IIntegrationModel;
  Logs: ILogModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'facebook_accounts',
    loadAccountClass(models)
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'facebook_configs',
    loadConfigClass(models)
  );
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'facebook_integrations',
    loadIntegrationClass(models)
  );
  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models));

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    'comments_facebooks',
    loadCommentClass(models)
  );

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'conversations_facebooks',
    loadConversationClass(models)
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers_facebooks',
    loadCustomerClass(models)
  );

  models.Posts = db.model<IPostDocument, IPostModel>(
    'posts_facebooks',
    loadPostClass(models)
  );

  models.ConversationMessages = db.model<
    IConversationMessageDocument,
    IConversationMessageModel
  >('conversation_messages_facebooks', loadConversationMessageClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
