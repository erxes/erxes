import mongoose from 'mongoose';
import { createGenerateModels } from 'erxes-api-shared/utils';
import { IMainContext } from 'erxes-api-shared/core-types';
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

import {
  ITicketPipelineModel,
  loadPipelineClass,
} from '@/ticket/db/models/Pipeline';
import { IStatusModel, loadStatusClass } from '@/ticket/db/models/Status';
import { ITicketModel, loadTicketClass } from '@/ticket/db/models/Ticket';
import { ITicketDocument } from '@/ticket/@types/ticket';
import { ITicketPipelineDocument } from '@/ticket/@types/pipeline';
import { IStatusDocument } from '@/ticket/@types/status';

import {
  IMessengerAppModel,
  loadClass as loadMessengerAppClass,
} from '@/inbox/db/models/MessengerApps';
import {
  IConfigModel,
  loadConfigClass,
  IConfigDocument,
} from '@/inbox/@types/configs';
import { IMessengerAppDocument } from '@/inbox/db/definitions/messengerApps';
import { IActivityModel, loadActivityClass } from '@/ticket/db/models/Activity';
import { IActivityDocument } from '@/ticket/@types/activity';

import { INoteModel, loadNoteClass } from '@/ticket/db/models/Note';
import { INoteDocument } from '@/ticket/@types/note';
import { ITicketConfigDocument } from './modules/ticket/@types/ticketConfig';
import {
  ITicketConfigModel,
  loadTicketConfigClass,
} from './modules/ticket/db/models/TicketConfig';

import {
  IResponseTemplateModel,
  loadClass as loadResponseTemplateClass,
} from '@/response/db/models/responseTemplates';
import { IResponseTemplateDocument } from '@/response/@types/responseTemplates';
import { IFieldDocument } from '@/form/db/definitions/fields';
import { IFormDocument } from '@/form/db/definitions/forms';
import { IFieldModel, loadFieldClass } from './modules/form/db/models/Fields';
import { IFormSubmissionDocument } from './modules/form/db/definitions/forms';
import {
  IFormModel,
  IFormSubmissionModel,
  loadFormClass,
  loadFormSubmissionClass,
} from './modules/form/db/models/Forms';

import { IArticleDocument } from '@/knowledgebase/@types/article';
import { ICategoryDocument } from '@/knowledgebase/@types/category';
import { ITopicDocument } from '@/knowledgebase/@types/topic';

import {
  IArticleModel,
  loadArticleClass,
} from '@/knowledgebase/db/models/Article';
import {
  ICategoryModel,
  loadCategoryClass,
} from '@/knowledgebase/db/models/Category';
import { ITopicModel, loadTopicClass } from '@/knowledgebase/db/models/Topic';

// Instagram imports
import {
  IInstagramIntegrationModel,
  loadInstagramIntegrationClass,
} from '@/integrations/instagram/db/models/Integrations';
import { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import {
  IInstagramAccountModel,
  loadInstagramAccountClass,
} from '@/integrations/instagram/db/models/Accounts';
import { IInstagramAccountDocument } from '@/integrations/instagram/@types/accounts';
import {
  IInstagramCustomerModel,
  loadInstagramCustomerClass,
} from '@/integrations/instagram/db/models/Customers';
import { IInstagramCustomerDocument } from '@/integrations/instagram/@types/customers';
import {
  IInstagramConversationModel,
  loadInstagramConversationClass,
} from '@/integrations/instagram/db/models/Conversations';
import { IInstagramConversationDocument } from '@/integrations/instagram/@types/conversations';
import {
  IInstagramConversationMessageModel,
  loadInstagramConversationMessageClass,
} from '@/integrations/instagram/db/models/ConversationMessages';
import { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';
import {
  IInstagramCommentConversationModel,
  loadInstagramCommentConversationClass,
} from '@/integrations/instagram/db/models/Comment_conversations';
import { IInstagramCommentConversationDocument } from '@/integrations/instagram/@types/comment_conversations';
import {
  IInstagramCommentConversationReplyModel,
  loadInstagramCommentConversationReplyClass,
} from '@/integrations/instagram/db/models/Comment_conversations_reply';
import { IInstagramCommentConversationReplyDocument } from '@/integrations/instagram/@types/comment_conversations_reply';
import {
  IInstagramPostConversationModel,
  loadInstagramPostConversationClass,
} from '@/integrations/instagram/db/models/PostConversations';
import { IInstagramPostConversationDocument } from '@/integrations/instagram/@types/postConversations';
import {
  IInstagramLogModel,
  loadInstagramLogClass,
} from '@/integrations/instagram/db/models/Logs';
import { IInstagramLogDocument } from '@/integrations/instagram/@types/logs';
import {
  IInstagramBotModel,
  loadInstagramBotClass,
} from '@/integrations/instagram/db/models/Bots';
import { IInstagramBotDocument } from '@/integrations/instagram/@types/bots';

import {
  IInstagramConfigModel,
  loadInstagramConfigClass,
} from '@/integrations/instagram/db/models/Config';
import { IInstagramConfigDocument } from './modules/integrations/instagram/@types/config';
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
  //instagram
  InstagramIntegrations: IInstagramIntegrationModel;
  InstagramAccounts: IInstagramAccountModel;
  InstagramCustomers: IInstagramCustomerModel;
  InstagramConversations: IInstagramConversationModel;
  InstagramConversationMessages: IInstagramConversationMessageModel;
  InstagramCommentConversation: IInstagramCommentConversationModel;
  InstagramCommentConversationReply: IInstagramCommentConversationReplyModel;
  InstagramLogs: IInstagramLogModel;
  InstagramPostConversations: IInstagramPostConversationModel;
  InstagramBots: IInstagramBotModel;
  InstagramConfigs: IInstagramConfigModel;

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

  // ticket
  Pipeline: ITicketPipelineModel;
  Status: IStatusModel;
  Ticket: ITicketModel;
  Activity: IActivityModel;
  Note: INoteModel;
  TicketConfig: ITicketConfigModel;

  MessengerApps: IMessengerAppModel;
  Configs: IConfigModel;

  //response templates
  ResponseTemplates: IResponseTemplateModel;

  Fields: IFieldModel;
  Forms: IFormModel;
  FormSubmissions: IFormSubmissionModel;

  //knowledgebase
  Article: IArticleModel;
  Category: ICategoryModel;
  Topic: ITopicModel;
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

  //response templates
  models.ResponseTemplates = db.model<
    IResponseTemplateDocument,
    IResponseTemplateModel
  >('response_templates', loadResponseTemplateClass(models));

  //ticket
  models.Pipeline = db.model<ITicketPipelineDocument, ITicketPipelineModel>(
    'frontline_tickets_pipeline',
    loadPipelineClass(models),
  );
  models.Status = db.model<IStatusDocument, IStatusModel>(
    'frontline_tickets_pipeline_status',
    loadStatusClass(models),
  );

  models.Ticket = db.model<ITicketDocument, ITicketModel>(
    'frontline_tickets',
    loadTicketClass(models),
  );
  models.Activity = db.model<IActivityDocument, IActivityModel>(
    'frontline_ticket_activities',
    loadActivityClass(models),
  );
  models.Note = db.model<INoteDocument, INoteModel>(
    'frontline_tickets_notes',
    loadNoteClass(models),
  );
  models.TicketConfig = db.model<ITicketConfigDocument, ITicketConfigModel>(
    'frontline_ticket_configs',
    loadTicketConfigClass(models),
  );
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

  // Instagram models
  models.InstagramIntegrations = db.model<
    IInstagramIntegrationDocument,
    IInstagramIntegrationModel
  >('instagram_integrations', loadInstagramIntegrationClass(models));
  models.InstagramAccounts = db.model<
    IInstagramAccountDocument,
    IInstagramAccountModel
  >('instagram_accounts', loadInstagramAccountClass(models));
  models.InstagramCustomers = db.model<
    IInstagramCustomerDocument,
    IInstagramCustomerModel
  >('instagram_customers', loadInstagramCustomerClass(models));
  models.InstagramConversations = db.model<
    IInstagramConversationDocument,
    IInstagramConversationModel
  >('instagram_conversations', loadInstagramConversationClass(models));
  models.InstagramConversationMessages = db.model<
    IInstagramConversationMessageDocument,
    IInstagramConversationMessageModel
  >(
    'instagram_conversation_messages',
    loadInstagramConversationMessageClass(models),
  );
  models.InstagramCommentConversation = db.model<
    IInstagramCommentConversationDocument,
    IInstagramCommentConversationModel
  >(
    'instagram_comment_conversations',
    loadInstagramCommentConversationClass(models),
  );
  models.InstagramCommentConversationReply = db.model<
    IInstagramCommentConversationReplyDocument,
    IInstagramCommentConversationReplyModel
  >(
    'instagram_comment_conversations_reply',
    loadInstagramCommentConversationReplyClass(models),
  );
  models.InstagramPostConversations = db.model<
    IInstagramPostConversationDocument,
    IInstagramPostConversationModel
  >('instagram_post_conversations', loadInstagramPostConversationClass(models));
  models.InstagramLogs = db.model<IInstagramLogDocument, IInstagramLogModel>(
    'instagram_logs',
    loadInstagramLogClass(models),
  );
  models.InstagramBots = db.model<IInstagramBotDocument, IInstagramBotModel>(
    'instagram_bots',
    loadInstagramBotClass(models),
  );

  models.InstagramConfigs = db.model<
    IInstagramConfigDocument,
    IInstagramConfigModel
  >('instagram_configs', loadInstagramConfigClass(models));

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
  models.MessengerApps = db.model<IMessengerAppDocument, IMessengerAppModel>(
    'messenger_apps',
    loadMessengerAppClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models),
  );
  models.Fields = db.model<IFieldDocument, IFieldModel>(
    'frontline_form_fields',
    loadFieldClass(models, subdomain),
  );
  models.Forms = db.model<IFormDocument, IFormModel>(
    'frontline_forms',
    loadFormClass(models),
  );
  models.FormSubmissions = db.model<
    IFormSubmissionDocument,
    IFormSubmissionModel
  >('frontline_form_submissions', loadFormSubmissionClass(models));

  models.Article = db.model<IArticleDocument, IArticleModel>(
    'knowledgebase_articles',
    loadArticleClass(models),
  );

  models.Category = db.model<ICategoryDocument, ICategoryModel>(
    'knowledgebase_categories',
    loadCategoryClass(models),
  );

  models.Topic = db.model<ITopicDocument, ITopicModel>(
    'knowledgebase_topics',
    loadTopicClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
