import * as mongoose from 'mongoose';

import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';

import {
  ICommentConversationModel,
  loadCommentConversationClass,
} from './models/Comment_conversations';
import {
  IConversationModel,
  loadConversationClass,
} from './models/Conversations';
import {
  ICommentConversationReplyModel,
  loadCommentConversationReplyClass,
} from './models/Comment_conversations_reply';

import { IConversationDocument } from './models/definitions/conversations';

import { ICustomerModel, loadCustomerClass } from './models/Customers';
import { ICustomerDocument } from './models/definitions/customers';

import { IConversationMessageDocument } from './models/definitions/conversationMessages';
import { IBotDocument } from './models/definitions/bots';
import {
  IConversationMessageModel,
  loadConversationMessageClass,
} from './models/ConversationMessages';
import {
  IAccountDocument,
  IAccountModel,
  loadAccountClass,
} from './models/Accounts';
import {
  IConfigDocument,
  IConfigModel,
  loadConfigClass,
} from './models/Configs';
import {
  IIntegrationDocument,
  IIntegrationModel,
  loadIntegrationClass,
} from './models/Integrations';
import { IBotModel, loadBotClass } from './models/Bots';
import { ILogModel, loadLogClass } from './models/Logs';
import { ILogDocument } from './models/definitions/logs';
import {
  IPostConversationModel,
  loadPostConversationClass,
} from './models/PostConversations';
import { IPostConversationDocument } from './models/definitions/postConversations';
import { ICommentConversationDocument } from './models/definitions/comment_conversations';
import { ICommentConversationReplyDocument } from './models/definitions/comment_conversations_reply';

export interface IModels {
  CommentConversation: ICommentConversationModel;
  CommentConversationReply: ICommentConversationReplyModel;
  PostConversations: IPostConversationModel;
  Conversations: IConversationModel;
  Customers: ICustomerModel;
  ConversationMessages: IConversationMessageModel;
  Accounts: IAccountModel;
  Configs: IConfigModel;
  Integrations: IIntegrationModel;
  Logs: ILogModel;
  Bots: IBotModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;
  models.CommentConversation = db.model<
    ICommentConversationDocument,
    ICommentConversationModel
  >('comment_conversations_facebook', loadCommentConversationClass(models));
  models.CommentConversationReply = db.model<
    ICommentConversationReplyDocument,
    ICommentConversationReplyModel
  >(
    'comment_conversations_reply_facebook',
    loadCommentConversationReplyClass(models)
  );
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
  models.Logs = db.model<ILogDocument, ILogModel>(
    'facebook_logs',
    loadLogClass(models)
  );

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'conversations_facebooks',
    loadConversationClass(models)
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'customers_facebooks',
    loadCustomerClass(models)
  );

  models.PostConversations = db.model<
    IPostConversationDocument,
    IPostConversationModel
  >('posts_conversations_facebooks', loadPostConversationClass(models));

  models.ConversationMessages = db.model<
    IConversationMessageDocument,
    IConversationMessageModel
  >('conversation_messages_facebooks', loadConversationMessageClass(models));

  models.Bots = db.model<IBotDocument, IBotModel>(
    'facebook_messengers_bots',
    loadBotClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
