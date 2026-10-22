import type { Connection } from 'mongoose';
import type { IModels } from './types';
// Instagram imports
// Instagram imports
import {
  type IInstagramIntegrationModel,
  loadInstagramIntegrationClass,
} from '@/integrations/instagram/db/models/Integrations';
import type { IInstagramIntegrationDocument } from '@/integrations/instagram/@types/integrations';
import {
  type IInstagramAccountModel,
  loadInstagramAccountClass,
} from '@/integrations/instagram/db/models/Accounts';
import type { IInstagramAccountDocument } from '@/integrations/instagram/@types/accounts';
import {
  type IInstagramCustomerModel,
  loadInstagramCustomerClass,
} from '@/integrations/instagram/db/models/Customers';
import type { IInstagramCustomerDocument } from '@/integrations/instagram/@types/customers';
import {
  type IInstagramConversationModel,
  loadInstagramConversationClass,
} from '@/integrations/instagram/db/models/Conversations';
import type { IInstagramConversationDocument } from '@/integrations/instagram/@types/conversations';
import {
  type IInstagramConversationMessageModel,
  loadInstagramConversationMessageClass,
} from '@/integrations/instagram/db/models/ConversationMessages';
import type { IInstagramConversationMessageDocument } from '@/integrations/instagram/@types/conversationMessages';
import {
  type IInstagramCommentConversationModel,
  loadInstagramCommentConversationClass,
} from '@/integrations/instagram/db/models/Comment_conversations';
import type { IInstagramCommentConversationDocument } from '@/integrations/instagram/@types/comment_conversations';
import {
  type IInstagramCommentConversationReplyModel,
  loadInstagramCommentConversationReplyClass,
} from '@/integrations/instagram/db/models/Comment_conversations_reply';
import type { IInstagramCommentConversationReplyDocument } from '@/integrations/instagram/@types/comment_conversations_reply';
import {
  type IInstagramPostConversationModel,
  loadInstagramPostConversationClass,
} from '@/integrations/instagram/db/models/PostConversations';
import type { IInstagramPostConversationDocument } from '@/integrations/instagram/@types/postConversations';
import {
  type IInstagramLogModel,
  loadInstagramLogClass,
} from '@/integrations/instagram/db/models/Logs';
import type { IInstagramLogDocument } from '@/integrations/instagram/@types/logs';
import {
  type IInstagramBotModel,
  loadInstagramBotClass,
} from '@/integrations/instagram/db/models/Bots';
import type { IInstagramBotDocument } from '@/integrations/instagram/@types/bots';
import {
  type IInstagramConfigModel,
  loadInstagramConfigClass,
} from '@/integrations/instagram/db/models/Config';
import type { IInstagramConfigDocument } from '@/integrations/instagram/@types/config';
export const registerInstagramModels = (
  db: Connection,
  models: IModels,
  subdomain: string,
): void => {
  models.InstagramIntegrations = db.model<
    IInstagramIntegrationDocument,
    IInstagramIntegrationModel
  >('instagram_integrations', loadInstagramIntegrationClass(models, subdomain));
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
};
