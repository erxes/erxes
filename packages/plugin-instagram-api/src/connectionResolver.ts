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
import { IBotModel, loadBotClass } from './models/Bots';
import { IBotDocument } from './models/definitions/bots';
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
  Bots: IBotModel;

}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.PostConversations = db.model<
    IPostConversationDocument,
    IPostConversationModel
  >('instagram_posts_conversations', loadPostConversationClass(models));

  models.CommentConversation = db.model<
    ICommentConversationDocument,
    ICommentConversationModel
  >('instagram_comment_conversations', loadCommentConversationClass(models));
  models.CommentConversationReply = db.model<
    ICommentConversationReplyDocument,
    ICommentConversationReplyModel
  >(
    'instagram_conversations_reply_facebook',
    loadCommentConversationReplyClass(models)
  );
  models.Accounts = db.model<IAccountDocument, IAccountModel>(
    'instagram_accounts',
    loadAccountClass(models)
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'instagram_configs',
    loadConfigClass(models)
  );
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'instagram_integrations',
    loadIntegrationClass(models)
  );
  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models));

  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'instagram_conversations',
    loadConversationClass(models)
  );

  models.Customers = db.model<ICustomerDocument, ICustomerModel>(
    'instagram_customers',
    loadCustomerClass(models)
  );

  models.ConversationMessages = db.model<
    IConversationMessageDocument,
    IConversationMessageModel
  >('instagram_conversation_messages', loadConversationMessageClass(models));

  models.Bots = db.model<IBotDocument, IBotModel>(
    'instagram_messengers_bots',
    loadBotClass(models)
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
