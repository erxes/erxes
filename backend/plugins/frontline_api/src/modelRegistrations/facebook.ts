import type { Connection } from 'mongoose';
import type { IModels } from './types';
import type { IFacebookIntegrationDocument } from '@/integrations/facebook/@types/integrations';
import type { IFacebookLogDocument } from '@/integrations/facebook/@types/logs';
import type { IFacebookAccountDocument } from '@/integrations/facebook/@types/accounts';
import type { IFacebookCustomerDocument } from '@/integrations/facebook/@types/customers';
import type { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import type { IFacebookConversationMessageDocument } from '@/integrations/facebook/@types/conversationMessages';
import type { IFacebookCommentConversationDocument } from '@/integrations/facebook/@types/comment_conversations';
import type { IFacebookCommentConversationReplyDocument } from '@/integrations/facebook/@types/comment_conversations_reply';
import type { IFacebookCommentOutboxDocument } from '@/integrations/facebook/db/definitions/comment_outbox';
import {
  type IFacebookCommentOutboxModel,
  loadFacebookCommentOutboxClass,
} from '@/integrations/facebook/db/models/CommentOutbox';
import type { IFacebookPostConversationDocument } from '@/integrations/facebook/@types/postConversations';
import type { IFacebookConfigDocument } from '@/integrations/facebook/@types/config';
import {
  type IFacebookIntegrationModel,
  loadFacebookIntegrationClass,
} from '@/integrations/facebook/db/models/Integrations';
import {
  type IFacebookAccountModel,
  loadFacebookAccountClass,
} from '@/integrations/facebook/db/models/Accounts';
import {
  type IFacebookCustomerModel,
  loadFacebookCustomerClass,
} from '@/integrations/facebook/db/models/Customers';
import {
  type IFacebookConversationModel,
  loadFacebookConversationClass,
} from '@/integrations/facebook/db/models/Conversations';
import {
  type IFacebookConversationMessageModel,
  loadFacebookConversationMessageClass,
} from '@/integrations/facebook/db/models/ConversationMessages';
import {
  type IFacebookCommentConversationModel,
  loadFacebookCommentConversationClass,
} from '@/integrations/facebook/db/models/Comment_conversations';
import {
  type IFacebookCommentConversationReplyModel,
  loadFacebookCommentConversationReplyClass,
} from '@/integrations/facebook/db/models/Comment_conversations_reply';
import {
  type IFacebookLogModel,
  loadFacebookLogClass,
} from '@/integrations/facebook/db/models/Logs';
import {
  type IFacebookPostConversationModel,
  loadFacebookPostConversationClass,
} from '@/integrations/facebook/db/models/PostConversations';
import {
  type IFacebookConfigModel,
  loadFacebookConfigClass,
} from '@/integrations/facebook/db/models/Config';
import type { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import {
  type IFacebookBotModel,
  loadFacebookBotClass,
} from '@/integrations/facebook/db/models/Bots';
export const registerFacebookModels = (
  db: Connection,
  models: IModels,
  subdomain: string,
): void => {
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
  models.FacebookCommentOutbox = db.model<
    IFacebookCommentOutboxDocument,
    IFacebookCommentOutboxModel
  >('comment_outbox_facebook', loadFacebookCommentOutboxClass(models));
  models.FacebookIntegrations = db.model<
    IFacebookIntegrationDocument,
    IFacebookIntegrationModel
  >('facebook_integrations', loadFacebookIntegrationClass(models, subdomain));
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
};

export const registerFacebookBotModel = (
  db: Connection,
  models: IModels,
  subdomain: string,
): void => {
  models.FacebookBots = db.model<IFacebookBotDocument, IFacebookBotModel>(
    'facebook_messengers_bots',
    loadFacebookBotClass(models, subdomain),
  );
};
