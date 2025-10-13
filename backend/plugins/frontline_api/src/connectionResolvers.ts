import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
import mongoose from 'mongoose';

import { IIntegrationDocument } from '@/inbox/@types/integrations';
import { IConversationDocument } from '@/inbox/@types/conversations';
import { IMessageDocument } from '@/inbox/@types/conversationMessages';
import { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import { IFacebookLogDocument } from '@/integrations/facebook/@types/logs';
import { IFacebookAccountDocument } from '@/integrations/facebook/@types/accounts';
import { IFacebookCustomerDocument } from '@/integrations/facebook/@types/customers';
import { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import { IFacebookCommentConversationDocument } from '@/integrations/facebook/@types/comment_conversations';
import { IFacebookCommentConversationReplyDocument } from '@/integrations/facebook/@types/comment_conversations_reply';
import { IFacebookPostConversationDocument } from '@/integrations/facebook/@types/postConversations';
import { IFacebookConfigDocument } from '@/integrations/facebook/@types/config';
import { IChannelModel, loadChannelClass } from '@/channel/db/models/Channel';
import {
  IIntegrationModel,
  loadClass as loadIntegrationClass,
} from '@/inbox/db/models/Integrations';
import {
  IConversationModel,
  loadClass as loadConversationClass,
} from '@/inbox/db/models/Conversations';
import {
  IMessageModel,
  loadClass as loadMessageClass,
} from '@/inbox/db/models/ConversationMessages';
import {
  IFacebookIntegrationModel,
  loadFacebookIntegrationClass,
} from '@/integrations/facebook/db/models/Integrations';
import {
  IFacebookAccountModel,
  loadFacebookAccountClass,
} from '@/integrations/facebook/db/models/Accounts';
import {
  IFacebookCustomerModel,
  loadFacebookCustomerClass,
} from '@/integrations/facebook/db/models/Customers';
import {
  IFacebookConversationModel,
  loadFacebookConversationClass,
} from '@/integrations/facebook/db/models/Conversations';
import {
  IFacebookConversationMessageModel,
  loadFacebookConversationMessageClass,
} from '@/integrations/facebook/db/models/ConversationMessages';
import {
  IFacebookCommentConversationModel,
  loadFacebookCommentConversationClass,
} from '@/integrations/facebook/db/models/Comment_conversations';
import {
  IFacebookCommentConversationReplyModel,
  loadFacebookCommentConversationReplyClass,
} from '@/integrations/facebook/db/models/Comment_conversations_reply';
import {
  IFacebookLogModel,
  loadFacebookLogClass,
} from '@/integrations/facebook/db/models/Logs';
import {
  IFacebookPostConversationModel,
  loadFacebookPostConversationClass,
} from '@/integrations/facebook/db/models/PostConversations';
import {
  IFacebookConfigModel,
  loadFacebookConfigClass,
} from '@/integrations/facebook/db/models/Config';
import {
  ICallCdrModel,
  loadCallCdrClass,
} from '@/integrations/call/db/models/Cdrs';
import {
  ICallHistoryModel,
  loadCallHistoryClass,
} from '@/integrations/call/db/models/Histories';
import {
  ICallCustomerModel,
  loadCallCustomerClass,
} from '@/integrations/call/db/models/Customers';
import {
  ICallIntegrationModel,
  loadCallIntegrationClass,
} from '@/integrations/call/db/models/Integrations';
import {
  ICallConfigModel,
  loadCallConfigClass,
} from '@/integrations/call/db/models/Configs';
import {
  ICallOperatorModel,
  loadCallOperatorClass,
} from '@/integrations/call/db/models/Operators';

import {
  ICallQueueStatisticsModel,
  loadCallQueueClass,
} from '@/integrations/call/db/models/QueueStatistics';
import { ICallCdrDocument } from '@/integrations/call/@types/cdrs';
import { ICallOperatorDocuments } from '@/integrations/call/@types/operators';
import { ICallConfigDocument } from '@/integrations/call/@types/config';
import { ICallHistoryDocument } from '@/integrations/call/@types/histories';
import { ICallCustomer } from '@/integrations/call/@types/customers';
import { ICallIntegrationDocument } from '@/integrations/call/@types/integrations';
import { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import {
  IFacebookBotModel,
  loadFacebookBotClass,
} from '@/integrations/facebook/db/models/Bots';

import {
  ICustomerImapDocument,
  IIntegrationImapDocument,
  IMessageImapDocument,
  ICustomerImapModel,
  IIntegrationImapModel,
  IMessageImapModel,
  loadImapCustomerClass,
  loadImapIntegrationClass,
  loadImapMessageClass,
  ILogImapModel,
  ILogImapDocument,
  loadImapLogClass,
} from '@/integrations/imap/models';
import {
  IChannelMemberModel,
  loadChannelMemberClass,
} from '@/channel/db/models/ChannelMembers';
import {
  IChannelDocument,
  IChannelMemberDocument,
} from '@/channel/@types/channel';
import { ICallQueueStatisticsDocuments } from '@/integrations/call/@types/queueStatistics';
export interface IModels {
  //channel
  Channels: IChannelModel;
  ChannelMembers: IChannelMemberModel;

  //inbox
  Integrations: IIntegrationModel;
  Conversations: IConversationModel;
  ConversationMessages: IMessageModel;
  //facebook
  FacebookIntegrations: IFacebookIntegrationModel;
  FacebookAccounts: IFacebookAccountModel;
  FacebookCustomers: IFacebookCustomerModel;
  FacebookConversations: IFacebookConversationModel;
  FacebookConversationMessages: IFacebookConversationMessageModel;
  FacebookCommentConversation: IFacebookCommentConversationModel;
  FacebookCommentConversationReply: IFacebookCommentConversationReplyModel;
  FacebookLogs: IFacebookLogModel;
  FacebookPostConversations: IFacebookPostConversationModel;
  FacebookConfigs: IFacebookConfigModel;
  //call
  CallIntegrations: ICallIntegrationModel;
  CallCustomers: ICallCustomerModel;
  CallHistory: ICallHistoryModel;
  CallConfigs: ICallConfigModel;
  CallOperators: ICallOperatorModel;
  CallCdrs: ICallCdrModel;
  CallQueueStatistics: ICallQueueStatisticsModel;

  FacebookBots: IFacebookBotModel;
  //imap
  ImapCustomers: ICustomerImapModel;
  ImapIntegrations: IIntegrationImapModel;
  ImapMessages: IMessageImapModel;
  ImapLogs: ILogImapModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: any;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;
  //inbox models
  models.Channels = db.model<IChannelDocument, IChannelModel>(
    'channels',
    loadChannelClass(models),
  );
  models.ChannelMembers = db.model<IChannelMemberDocument, IChannelMemberModel>(
    'channel_members',
    loadChannelMemberClass(models),
  );
  models.Integrations = db.model<IIntegrationDocument, IIntegrationModel>(
    'integrations',
    loadIntegrationClass(models, subdomain),
  );
  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'conversations',
    loadConversationClass(models),
  );
  models.ConversationMessages = db.model<IMessageDocument, IMessageModel>(
    'conversation_messages',
    loadMessageClass(models),
  );
  //facebook models
  models.FacebookAccounts = db.model<
    IFacebookAccountDocument,
    IFacebookAccountModel
  >('facebook_accounts', loadFacebookAccountClass(models));
  models.FacebookCustomers = db.model<
    IFacebookCustomerDocument,
    IFacebookCustomerModel
  >('customers_facebooks', loadFacebookCustomerClass(models));
  models.FacebookConversations = db.model<
    IFacebookConversationDocument,
    IFacebookConversationModel
  >('conversations_facebooks', loadFacebookConversationClass(models));
  models.FacebookConversationMessages = db.model<
    IFacebookConversationMessageDocument,
    IFacebookConversationMessageModel
  >(
    'conversation_messages_facebooks',
    loadFacebookConversationMessageClass(models),
  );
  models.FacebookCommentConversation = db.model<
    IFacebookCommentConversationDocument,
    IFacebookCommentConversationModel
  >(
    'comment_conversations_facebook',
    loadFacebookCommentConversationClass(models),
  );
  models.FacebookCommentConversationReply = db.model<
    IFacebookCommentConversationReplyDocument,
    IFacebookCommentConversationReplyModel
  >(
    'comment_conversations_reply_facebook',
    loadFacebookCommentConversationReplyClass(models),
  );
  models.FacebookIntegrations = db.model<
    IFacebookIntegrationDocument,
    IFacebookIntegrationModel
  >('facebook_integrations', loadFacebookIntegrationClass(models));
  models.FacebookLogs = db.model<IFacebookLogDocument, IFacebookLogModel>(
    'facebook_logs',
    loadFacebookLogClass(models),
  );
  models.FacebookPostConversations = db.model<
    IFacebookPostConversationDocument,
    IFacebookPostConversationModel
  >('posts_conversations_facebooks', loadFacebookPostConversationClass(models));
  models.FacebookConfigs = db.model<
    IFacebookConfigDocument,
    IFacebookConfigModel
  >('facebook_configs', loadFacebookConfigClass(models));
  //call models
  models.CallIntegrations = db.model<
    ICallIntegrationDocument,
    ICallIntegrationModel
  >('calls_integrations', loadCallIntegrationClass(models));
  models.CallCustomers = db.model<ICallCustomer, ICallCustomerModel>(
    'calls_customers',
    loadCallCustomerClass(models),
  );

  models.CallHistory = db.model<ICallHistoryDocument, ICallHistoryModel>(
    'calls_history',
    loadCallHistoryClass(models),
  );
  models.CallConfigs = db.model<ICallConfigDocument, ICallConfigModel>(
    'calls_configs',
    loadCallConfigClass(models),
  );
  models.CallOperators = db.model<ICallOperatorDocuments, ICallOperatorModel>(
    'calls_operators',
    loadCallOperatorClass(models),
  );
  models.CallCdrs = db.model<ICallCdrDocument, ICallCdrModel>(
    'calls_cdr',
    loadCallCdrClass(models),
  );
  models.CallQueueStatistics = db.model<
    ICallQueueStatisticsDocuments,
    ICallQueueStatisticsModel
  >('calls_queue_statistics', loadCallQueueClass());

  models.FacebookBots = db.model<IFacebookBotDocument, IFacebookBotModel>(
    'facebook_messengers_bots',
    loadFacebookBotClass(models),
  );
  //imap models
  models.ImapCustomers = db.model<ICustomerImapDocument, ICustomerImapModel>(
    'imap_customers',
    loadImapCustomerClass(models),
  );
  models.ImapIntegrations = db.model<
    IIntegrationImapDocument,
    IIntegrationImapModel
  >('imap_integrations', loadImapIntegrationClass(models));
  models.ImapMessages = db.model<IMessageImapDocument, IMessageImapModel>(
    'imap_messages',
    loadImapMessageClass(models),
  );
  models.ImapLogs = db.model<ILogImapDocument, ILogImapModel>(
    'imap_logs',
    loadImapLogClass(models),
  );
  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
