import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
} from '@/inbox/db/definitions/constants';
import { handleFacebookIntegration } from '@/integrations/facebook/messageBroker';
import { handleInstagramIntegration } from '@/integrations/instagram/messageBroker';
import { handleDiscordIntegration } from '@/integrations/discord/messageBroker';
import { handleTelegramIntegration } from '@/integrations/telegram/messageBroker';
import { publishConversationUnreadCounts } from '@/inbox/services/conversationUnreadCounts';
import { getErrorMessage } from '@/integrations/utils';
import type { IModels } from '~/connectionResolvers';
import { debugError } from '~/modules/inbox/utils';

interface DispatchConversationData {
  action: string;
  type: string;
  payload: string;
  integrationId: string;
}

export const publishUnreadCountsSafely = async (
  params: Parameters<typeof publishConversationUnreadCounts>[0],
) => {
  try {
    await publishConversationUnreadCounts(params);
  } catch (error) {
    debugError(
      `Failed to publish conversation unread counts: ${getErrorMessage(error)}`,
    );
  }
};

export const dispatchConversationToService = async (
  subdomain: string,
  serviceName: string,
  data: DispatchConversationData,
) => {
  try {
    switch (serviceName) {
      case 'facebook':
        return await handleFacebookIntegration({ subdomain, data });

      case 'instagram':
        return await handleInstagramIntegration({ subdomain, data });

      case 'discord':
        return await handleDiscordIntegration({ subdomain, data });

      case 'telegram':
        return await handleTelegramIntegration({ subdomain, data });

      case 'calls':
        break;

      case 'mobinetSms':
        break;

      case 'messenger':
        break;

      default:
        throw new Error(`Unsupported service: ${serviceName}`);
    }
  } catch (e) {
    throw new Error(
      `Your message was not sent. Error: ${getErrorMessage(
        e,
      )}. Go to integrations list and fix it.`,
    );
  }
};

export const markAutomatedReplyHumanActive = async ({
  models,
  conversation,
  userId,
}: {
  models: IModels;
  conversation: IConversationDocument;
  userId: string;
}) => {
  if (!conversation.automatedReplyControl) {
    return;
  }

  await models.Conversations.setAutomatedReplyControl(conversation._id, {
    status: AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE,
    reason: AUTOMATED_REPLY_REASON.OPERATOR_REPLY,
    updatedBy: userId,
  });
};

export const getAutomatedReplyStatus = (status: string) => {
  switch (status) {
    case AUTOMATED_REPLY_STATUS.ACTIVE:
      return AUTOMATED_REPLY_STATUS.ACTIVE;
    case AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED:
      return AUTOMATED_REPLY_STATUS.HANDOFF_REQUESTED;
    case AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE:
      return AUTOMATED_REPLY_STATUS.HUMAN_ACTIVE;
    default:
      throw new Error('Invalid automated reply status');
  }
};

export const getAutomatedReplyReason = (reason?: string) => {
  if (!reason) {
    return AUTOMATED_REPLY_REASON.MANUAL;
  }

  switch (reason) {
    case AUTOMATED_REPLY_REASON.CUSTOMER_REQUESTED:
      return AUTOMATED_REPLY_REASON.CUSTOMER_REQUESTED;
    case AUTOMATED_REPLY_REASON.OPERATOR_REPLY:
      return AUTOMATED_REPLY_REASON.OPERATOR_REPLY;
    case AUTOMATED_REPLY_REASON.MANUAL:
      return AUTOMATED_REPLY_REASON.MANUAL;
    case AUTOMATED_REPLY_REASON.TIMEOUT_EXPIRED:
      return AUTOMATED_REPLY_REASON.TIMEOUT_EXPIRED;
    default:
      throw new Error('Invalid automated reply reason');
  }
};
