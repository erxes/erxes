import type { Connection } from 'mongoose';
import type { IModels } from './types';
import { withConversationReportEvents } from '@/reports/services/conversationReportEvents';
import type { IIntegrationDocument } from '@/inbox/@types/integrations';
import type { IConversationDocument } from '@/inbox/@types/conversations';
import type { IMessageDocument } from '@/inbox/@types/conversationMessages';
import {
  type IChannelModel,
  loadChannelClass,
} from '@/channel/db/models/Channel';
import {
  type IIntegrationModel,
  loadClass as loadIntegrationClass,
} from '@/inbox/db/models/Integrations';
import {
  type IConversationModel,
  loadClass as loadConversationClass,
} from '@/inbox/db/models/Conversations';
import {
  type IMessageModel,
  loadClass as loadMessageClass,
} from '@/inbox/db/models/ConversationMessages';
import {
  type IChannelMemberModel,
  loadChannelMemberClass,
} from '@/channel/db/models/ChannelMembers';
import type {
  IChannelDocument,
  IChannelMemberDocument,
} from '@/channel/@types/channel';
import {
  type IMessengerAppModel,
  loadClass as loadMessengerAppClass,
} from '@/inbox/db/models/MessengerApps';
import {
  type IConfigModel,
  loadConfigClass,
  type IConfigDocument,
} from '@/inbox/@types/configs';
import type { IMessengerAppDocument } from '@/inbox/db/definitions/messengerApps';
import {
  type IResponseTemplateModel,
  loadClass as loadResponseTemplateClass,
} from '@/response/db/models/responseTemplates';
import type { IResponseTemplateDocument } from '@/response/@types/responseTemplates';
export const registerResponseTemplateModel = (
  db: Connection,
  models: IModels,
): void => {
  models.ResponseTemplates = db.model<
    IResponseTemplateDocument,
    IResponseTemplateModel
  >('response_templates', loadResponseTemplateClass(models));
};

export const registerInboxModels = (
  db: Connection,
  models: IModels,
  subdomain: string,
): void => {
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
    db.models.integrations
      ? undefined
      : withConversationReportEvents(
          loadIntegrationClass(models, subdomain),
          subdomain,
        ),
  );
  models.Conversations = db.model<IConversationDocument, IConversationModel>(
    'conversations',
    db.models.conversations
      ? undefined
      : withConversationReportEvents(
          loadConversationClass(models, subdomain),
          subdomain,
        ),
  );
  models.ConversationMessages = db.model<IMessageDocument, IMessageModel>(
    'conversation_messages',
    db.models.conversation_messages
      ? undefined
      : withConversationReportEvents(loadMessageClass(models), subdomain),
  );
};

export const registerMessengerModels = (
  db: Connection,
  models: IModels,
): void => {
  models.MessengerApps = db.model<IMessengerAppDocument, IMessengerAppModel>(
    'messenger_apps',
    loadMessengerAppClass(models),
  );
  models.Configs = db.model<IConfigDocument, IConfigModel>(
    'configs',
    loadConfigClass(models),
  );
};
