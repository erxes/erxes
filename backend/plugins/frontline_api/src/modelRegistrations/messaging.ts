import type { Connection } from 'mongoose';
import type { IModels } from './types';
// Discord integration models
// Discord integration models
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type { IDiscordCustomerDocument } from '@/integrations/discord/@types/customers';
import type { IDiscordConversationDocument } from '@/integrations/discord/@types/conversations';
import type { IDiscordConversationMessageDocument } from '@/integrations/discord/@types/conversationMessages';
import {
  type IDiscordBotModel,
  loadDiscordBotClass,
} from '@/integrations/discord/db/models/Bots';
import {
  type IDiscordCustomerModel,
  loadDiscordCustomerClass,
} from '@/integrations/discord/db/models/Customers';
import {
  type IDiscordConversationModel,
  loadDiscordConversationClass,
} from '@/integrations/discord/db/models/Conversations';
import {
  type IDiscordConversationMessageModel,
  loadDiscordConversationMessageClass,
} from '@/integrations/discord/db/models/ConversationMessages';
import type {
  ITelegramReactionDocument,
  ITelegramReactionModel,
} from '@/integrations/telegram/@types/reactions';
import { loadTelegramReactionClass } from '@/integrations/telegram/db/models/Reactions';
//Telegram imports
//Telegram imports
import type { ITelegramBotDocument } from '@/integrations/telegram/@types/bot';
import {
  type ITelegramBotModel,
  loadTelegramBotClass,
} from '@/integrations/telegram/db/models/Bots';
import type { ITelegramCustomerDocument } from '@/integrations/telegram/@types/customers';
import {
  type ITelegramCustomerModel,
  loadTelegramCustomerClass,
} from '@/integrations/telegram/db/models/Customers';
import type { ITelegramConversationDocument } from '@/integrations/telegram/@types/conversations';
import {
  type ITelegramConversationModel,
  loadTelegramConversationClass,
} from '@/integrations/telegram/db/models/Conversations';
import type { ITelegramConversationMessageDocument } from '@/integrations/telegram/@types/conversationMessages';
import {
  type ITelegramConversationMessageModel,
  loadTelegramConversationMessageClass,
} from '@/integrations/telegram/db/models/ConversationMessages';
import type { IMailIntegrationDocument } from '@/integrations/mail/@types/integration';
import type { IMailCustomerDocument } from '@/integrations/mail/@types/customer';
import type { IMailMessageDocument } from '@/integrations/mail/@types/message';
import type { IMailDraftDocument } from '@/integrations/mail/@types/draft';
import type { IMailCloudflareDocument } from '@/integrations/mail/@types/cloudflare';
import {
  type IMailIntegrationModel,
  loadMailIntegrationClass,
} from '@/integrations/mail/db/models/Integrations';
import {
  type IMailCustomerModel,
  loadMailCustomerClass,
} from '@/integrations/mail/db/models/Customers';
import {
  type IMailMessageModel,
  loadMailMessageClass,
} from '@/integrations/mail/db/models/Messages';
import {
  type IMailDraftModel,
  loadMailDraftClass,
} from '@/integrations/mail/db/models/Drafts';
import {
  type IMailCloudflareModel,
  loadMailCloudflareClass,
} from '@/integrations/mail/db/models/CloudflareConnections';
export const registerChatModels = (db: Connection, models: IModels): void => {
  models.DiscordBots = db.model<IDiscordBotDocument, IDiscordBotModel>(
    'discord_bots',
    loadDiscordBotClass(models),
  );
  models.DiscordCustomers = db.model<
    IDiscordCustomerDocument,
    IDiscordCustomerModel
  >('customers_discord', loadDiscordCustomerClass(models));
  models.DiscordConversations = db.model<
    IDiscordConversationDocument,
    IDiscordConversationModel
  >('conversations_discord', loadDiscordConversationClass(models));
  models.DiscordConversationMessages = db.model<
    IDiscordConversationMessageDocument,
    IDiscordConversationMessageModel
  >(
    'conversation_messages_discord',
    loadDiscordConversationMessageClass(models),
  );
  models.TelegramReactions = db.model<
    ITelegramReactionDocument,
    ITelegramReactionModel
  >('telegram_reactions', loadTelegramReactionClass());
  models.TelegramBots = db.model<ITelegramBotDocument, ITelegramBotModel>(
    'telegram_bots',
    loadTelegramBotClass(models),
  );
  models.TelegramCustomers = db.model<
    ITelegramCustomerDocument,
    ITelegramCustomerModel
  >('customers_telegram', loadTelegramCustomerClass(models));
  models.TelegramConversations = db.model<
    ITelegramConversationDocument,
    ITelegramConversationModel
  >('conversations_telegram', loadTelegramConversationClass(models));
  models.TelegramConversationMessages = db.model<
    ITelegramConversationMessageDocument,
    ITelegramConversationMessageModel
  >(
    'conversation_messages_telegram',
    loadTelegramConversationMessageClass(models),
  );
};

export const registerMailModels = (db: Connection, models: IModels): void => {
  models.MailIntegrations = db.model<
    IMailIntegrationDocument,
    IMailIntegrationModel
  >('mail_integrations', loadMailIntegrationClass(models));
  models.MailCustomers = db.model<IMailCustomerDocument, IMailCustomerModel>(
    'mail_customers',
    loadMailCustomerClass(models),
  );
  models.MailMessages = db.model<IMailMessageDocument, IMailMessageModel>(
    'mail_messages',
    loadMailMessageClass(models),
  );
  models.MailDrafts = db.model<IMailDraftDocument, IMailDraftModel>(
    'mail_drafts',
    loadMailDraftClass(models),
  );
  models.MailCloudflare = db.model<
    IMailCloudflareDocument,
    IMailCloudflareModel
  >('mail_cloudflare', loadMailCloudflareClass(models), 'mail_cloudflare');
};
