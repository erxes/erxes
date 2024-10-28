import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import {
  IConversationModel,
  loadConversationClass
} from './models/Conversations';
import { IConversationDocument } from './models/definitions/conversations';

import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';

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
import {
  IPostConversationModel,
  loadPostConversationClass
} from './models/PostConversations';
import { IPostConversationDocument } from './models/definitions/postConversations';
import {
  ICommentConversationModel,
  loadCommentConversationClass
} from './models/Comment_conversations';
import {
  ICommentConversationReplyModel,
  loadCommentConversationReplyClass
} from './models/Comment_conversations_reply';

import { ICommentConversationDocument } from './models/definitions/comment_conversations';
import { ICommentConversationReplyDocument } from './models/definitions/comment_conversations_reply';
export interface IModels {
  PostConversations: IPostConversationModel;
  CommentConversation: ICommentConversationModel;
  CommentConversationReply: ICommentConversationReplyModel;
  Conversations: IConversationModel;
  Customers: ICustomerModel;
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

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'whatsapp_accounts',
    loadAccountClass(models)
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'whatsapp_configs',
    loadConfigClass(models)
  );
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'whatsapp_integrations',
    loadIntegrationClass(models)
  );
  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models));

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'whatsapp_conversations',
    loadConversationClass(models)
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'whatsapp_customers',
    loadCustomerClass(models)
  );

  models.ConversationMessages = db.model<
    IConversationMessageDocument,
    IConversationMessageModel
  >('whatsapp_conversation_messages', loadConversationMessageClass(models));

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
