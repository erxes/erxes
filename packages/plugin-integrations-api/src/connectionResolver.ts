import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src/types';
import {
  conversationSchema as callProConversationSchema,
  customerSchema as callProCustomerSchema,
  IConversationDocument as ICallProConversationDocument,
  IConversationModel as ICallProConversationModel,
  ICustomerDocument as ICallProCustomerDocument,
  ICustomerModel as ICallProCustomerModel
} from './callpro/models';
import {
  conversationMessageSchema as fbConversationMessageSchema,
  ICustomerDocument as IFbCustomerDocument,
  ICustomerModel as IFbCustomerModel,
  IConversationDocument as IFbConversationDocument,
  IConversationModel as IFbConversationModel,
  IConversationMessageDocument as IFbConversationMessageDocument,
  IConversationMessageModel as IFbConversationMessageModel,
  IPostDocument as IFbPostDocument,
  IPostModel as IFbPostModel,
  ICommentDocument as IFbCommentDocument,
  ICommentModel as IFbCommentModel,
  loadCustomerClass as loadFbCustomerClass,
  loadConversationClass as loadFbConversationClass,
  loadCommentClass as loadFbCommentClass,
  loadPostClass as loadfbPostClass
} from './facebook/models';

import { IAccountDocument, IAccountModel, loadAccountClass } from './models/Accounts';
import { IConfigDocument, IConfigModel, loadConfigClass } from './models/Configs';

import { IIntegrationDocument, IIntegrationModel, loadIntegrationClass } from './models/Integrations';
import { ILogDocument, ILogModel, loadLogClass } from './models/Logs';
import { createGenerateModels } from '@erxes/api-utils/src/core';


export interface IModels {
  Accounts: IAccountModel;
  Configs: IConfigModel;
  Integrations: IIntegrationModel;
  Logs: ILogModel;

  CallProCustomers: ICallProCustomerModel;
  CallProConversations: ICallProConversationModel;

  FbCustomers: IFbCustomerModel,
  FbConversations: IFbConversationModel,
  FbConversationMessages: IFbConversationMessageModel,
  FbPosts: IFbPostModel,
  FbComments: IFbCommentModel
}


export interface IContext extends IMainContext {
  subdomain: string,
  models: IModels
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection) => {
  models = {} as IModels;

  models.Accounts = db.model<IAccountDocument, IAccountModel>('accounts', loadAccountClass(models));
  models.Configs = db.model<IConfigDocument, IConfigModel>('configs', loadConfigClass(models));
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>('integrations', loadIntegrationClass(models));
  models.Logs = db.model<ILogDocument, ILogModel>('logs', loadLogClass(models))

  models.CallProCustomers = db.model<ICallProCustomerDocument, ICallProCustomerModel>('customers_callpro', callProCustomerSchema);
  models.CallProConversations = db.model<ICallProConversationDocument, ICallProConversationModel>('conversations_callpro', callProConversationSchema);


  models.FbCustomers = db.model<IFbCustomerDocument, IFbCustomerModel>('customers_facebook', loadFbCustomerClass(models));
  models.FbConversations = db.model<IFbConversationDocument, IFbConversationModel>('conversations_facebook', loadFbConversationClass(models));
  models.FbConversationMessages = db.model<IFbConversationMessageDocument, IFbConversationMessageModel>('conversation_messages_facebook', fbConversationMessageSchema);
  models.FbPosts = db.model<IFbPostDocument, IFbPostModel>('posts_facebook', loadfbPostClass(models));
  models.FbComments = db.model<IFbCommentDocument, IFbCommentModel>('comments_facebook', loadFbCommentClass(models))

  return models;
}

export const generateModels = createGenerateModels<IModels>(models, loadClasses)