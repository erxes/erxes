import type { IMainContext } from 'erxes-api-shared/core-types';
import type { IFacebookCommentOutboxModel } from '@/integrations/facebook/db/models/CommentOutbox';
import type { IChannelModel } from '@/channel/db/models/Channel';
import type { IIntegrationModel } from '@/inbox/db/models/Integrations';
import type { IConversationModel } from '@/inbox/db/models/Conversations';
import type { IMessageModel } from '@/inbox/db/models/ConversationMessages';
import type { IFacebookIntegrationModel } from '@/integrations/facebook/db/models/Integrations';
import type { IFacebookAccountModel } from '@/integrations/facebook/db/models/Accounts';
import type { IFacebookCustomerModel } from '@/integrations/facebook/db/models/Customers';
import type { IFacebookConversationModel } from '@/integrations/facebook/db/models/Conversations';
import type { IFacebookConversationMessageModel } from '@/integrations/facebook/db/models/ConversationMessages';
import type { IFacebookCommentConversationModel } from '@/integrations/facebook/db/models/Comment_conversations';
import type { IFacebookCommentConversationReplyModel } from '@/integrations/facebook/db/models/Comment_conversations_reply';
import type { IFacebookLogModel } from '@/integrations/facebook/db/models/Logs';
import type { IFacebookPostConversationModel } from '@/integrations/facebook/db/models/PostConversations';
import type { IFacebookConfigModel } from '@/integrations/facebook/db/models/Config';
import type { ICallCdrModel } from '@/integrations/call/db/models/Cdrs';
import type { ICallHistoryModel } from '@/integrations/call/db/models/Histories';
import type { ICallCustomerModel } from '@/integrations/call/db/models/Customers';
import type { ICallIntegrationModel } from '@/integrations/call/db/models/Integrations';
import type { ICallConfigModel } from '@/integrations/call/db/models/Configs';
import type { ICallOperatorModel } from '@/integrations/call/db/models/Operators';
import type { ICallQueueStatisticsModel } from '@/integrations/call/db/models/QueueStatistics';
import type { ICallSessionModel } from '@/integrations/call/db/models/CallSessions';
import type { IFacebookBotModel } from '@/integrations/facebook/db/models/Bots';
import type { IDiscordBotModel } from '@/integrations/discord/db/models/Bots';
import type { IDiscordCustomerModel } from '@/integrations/discord/db/models/Customers';
import type { IDiscordConversationModel } from '@/integrations/discord/db/models/Conversations';
import type { IDiscordConversationMessageModel } from '@/integrations/discord/db/models/ConversationMessages';
import type { ITelegramReactionModel } from '@/integrations/telegram/@types/reactions';
import type { ITelegramBotModel } from '@/integrations/telegram/db/models/Bots';
import type { ITelegramCustomerModel } from '@/integrations/telegram/db/models/Customers';
import type { ITelegramConversationModel } from '@/integrations/telegram/db/models/Conversations';
import type { ITelegramConversationMessageModel } from '@/integrations/telegram/db/models/ConversationMessages';
import type { ICallProIntegrationModel } from '@/integrations/callpro/db/models/Integrations';
import type { ICallProCustomerModel } from '@/integrations/callpro/db/models/Customers';
import type { ICallProConversationModel } from '@/integrations/callpro/db/models/Conversations';
import type { ICallProLogModel } from '@/integrations/callpro/db/models/Logs';
import type { IMailIntegrationModel } from '@/integrations/mail/db/models/Integrations';
import type { IMailCustomerModel } from '@/integrations/mail/db/models/Customers';
import type { IMailMessageModel } from '@/integrations/mail/db/models/Messages';
import type { IMailDraftModel } from '@/integrations/mail/db/models/Drafts';
import type { IMailCloudflareModel } from '@/integrations/mail/db/models/CloudflareConnections';
import type { IChannelMemberModel } from '@/channel/db/models/ChannelMembers';
import type { ITicketPipelineModel } from '@/ticket/db/models/Pipeline';
import type { IStatusModel } from '@/ticket/db/models/Status';
import type { ITicketModel } from '@/ticket/db/models/Ticket';
import type { IMessengerAppModel } from '@/inbox/db/models/MessengerApps';
import type { IConfigModel } from '@/inbox/@types/configs';
import type { IActivityModel } from '@/ticket/db/models/Activity';
import type { INoteModel } from '@/ticket/db/models/Note';
import type { ITicketConfigModel } from '@/ticket/db/models/TicketConfig';
import type { IResponseTemplateModel } from '@/response/db/models/responseTemplates';
import type { IFieldModel } from '@/form/db/models/Fields';
import type { IFormModel, IFormSubmissionModel } from '@/form/db/models/Forms';
import type { ISurveyModel } from '@/survey/db/models/Surveys';
import type { ISurveyVoteModel } from '@/survey/db/models/SurveyVotes';
import type { IArticleModel } from '@/knowledgebase/db/models/Article';
import type { ICategoryModel } from '@/knowledgebase/db/models/Category';
import type { ITopicModel } from '@/knowledgebase/db/models/Topic';
import type { IHelpCenterConfigModel } from '@/helpcenter/db/models/HelpCenterConfig';
// Instagram imports
// Instagram imports
import type { IInstagramIntegrationModel } from '@/integrations/instagram/db/models/Integrations';
import type { IInstagramAccountModel } from '@/integrations/instagram/db/models/Accounts';
import type { IInstagramCustomerModel } from '@/integrations/instagram/db/models/Customers';
import type { IInstagramConversationModel } from '@/integrations/instagram/db/models/Conversations';
import type { IInstagramConversationMessageModel } from '@/integrations/instagram/db/models/ConversationMessages';
import type { IInstagramCommentConversationModel } from '@/integrations/instagram/db/models/Comment_conversations';
import type { IInstagramCommentConversationReplyModel } from '@/integrations/instagram/db/models/Comment_conversations_reply';
import type { IInstagramPostConversationModel } from '@/integrations/instagram/db/models/PostConversations';
import type { IInstagramLogModel } from '@/integrations/instagram/db/models/Logs';
import type { IInstagramBotModel } from '@/integrations/instagram/db/models/Bots';
import type { IInstagramConfigModel } from '@/integrations/instagram/db/models/Config';
import type { IReportChartModel } from '@/reports/db/models/Charts';

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
  FacebookCommentOutbox: IFacebookCommentOutboxModel;
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
  CallSessions: ICallSessionModel;

  FacebookBots: IFacebookBotModel;

  // discord
  DiscordBots: IDiscordBotModel;
  DiscordCustomers: IDiscordCustomerModel;
  DiscordConversations: IDiscordConversationModel;
  DiscordConversationMessages: IDiscordConversationMessageModel;

  CallProIntegrations: ICallProIntegrationModel;
  CallProCustomers: ICallProCustomerModel;
  CallProConversations: ICallProConversationModel;
  CallProLogs: ICallProLogModel;

  MailIntegrations: IMailIntegrationModel;
  MailCustomers: IMailCustomerModel;
  MailMessages: IMailMessageModel;
  MailDrafts: IMailDraftModel;
  MailCloudflare: IMailCloudflareModel;

  // telegram
  TelegramReactions: ITelegramReactionModel;
  TelegramBots: ITelegramBotModel;
  TelegramCustomers: ITelegramCustomerModel;
  TelegramConversations: ITelegramConversationModel;
  TelegramConversationMessages: ITelegramConversationMessageModel;

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
  Surveys: ISurveyModel;
  SurveyVotes: ISurveyVoteModel;

  //knowledgebase
  Article: IArticleModel;
  Category: ICategoryModel;
  Topic: ITopicModel;

  HelpCenterConfigs: IHelpCenterConfigModel;

  ReportCharts: IReportChartModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
  serverTiming: unknown;
  commonQuerySelector: Record<string, unknown>;
}
