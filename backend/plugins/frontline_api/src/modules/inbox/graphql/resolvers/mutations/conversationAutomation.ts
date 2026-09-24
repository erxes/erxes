import { IConversationDocument } from '@/inbox/@types/conversations';
import {
  AUTOMATED_REPLY_REASON,
  AUTOMATED_REPLY_STATUS,
} from '@/inbox/db/definitions/constants';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import { handleFacebookIntegration } from '@/integrations/facebook/messageBroker';
import { sendReply } from '@/integrations/facebook/utils';
import { handleInstagramIntegration } from '@/integrations/instagram/messageBroker';
import { handleDiscordIntegration } from '@/integrations/discord/messageBroker';
import { publishConversationUnreadCounts } from '@/inbox/services/conversationUnreadCounts';
import type { IModels } from '~/connectionResolvers';
import { debugError } from '~/modules/inbox/utils';

interface DispatchConversationData {
  action: string;
  type: string;
  payload: string;
  integrationId: string;
}

const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';
const DEFAULT_AUTOMATION_ACTIVE_MESSAGE = 'Automated replies are active again.';
const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

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

const buildFacebookMessengerTextPayload = ({
  recipientId,
  text,
  tag,
}: {
  recipientId: string;
  text: string;
  tag?: string;
}) => {
  const trimmedTag = tag?.trim();
  const payload: {
    recipient: { id: string };
    message: { text: string };
    messaging_type: string;
    tag?: string;
  } = {
    recipient: { id: recipientId },
    message: { text },
    messaging_type: trimmedTag ? 'MESSAGE_TAG' : 'RESPONSE',
  };

  if (trimmedTag) {
    payload.tag = trimmedTag;
  }

  return payload;
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
      `Your message was not sent. Error: ${e.message}. Go to integrations list and fix it.`,
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

export const sendFacebookAutomatedReplyControlMessage = async ({
  models,
  subdomain,
  conversation,
  status,
}: {
  models: IModels;
  subdomain: string;
  conversation: IConversationDocument;
  status: string;
}) => {
  if (!conversation.integrationId) {
    throw new Error('Conversation integration is required for handoff message');
  }

  const integration = await models.Integrations.getIntegration({
    _id: conversation.integrationId,
  });

  if (integration.kind !== INTEGRATION_KINDS.MESSENGER) {
    return;
  }

  const facebookConversation =
    await models.FacebookConversations.getConversation({
      erxesApiId: conversation._id,
    });

  const bot = facebookConversation.botId
    ? await models.FacebookBots.findOne({ _id: facebookConversation.botId })
    : await models.FacebookBots.findOne({
        pageId: facebookConversation.recipientId,
      });

  if (!bot) {
    throw new Error('Facebook bot is required for handoff message');
  }

  const defaultText =
    status === AUTOMATED_REPLY_STATUS.ACTIVE
      ? DEFAULT_AUTOMATION_ACTIVE_MESSAGE
      : DEFAULT_HANDOFF_MESSAGE;
  const configuredText =
    status === AUTOMATED_REPLY_STATUS.ACTIVE
      ? bot.automationActiveMessage
      : bot.handoffMessage;
  const text = (configuredText || defaultText).trim() || defaultText;

  const sendHandoffReply = (tag?: string) =>
    sendReply(
      models,
      'me/messages',
      buildFacebookMessengerTextPayload({
        recipientId: facebookConversation.senderId,
        text,
        tag,
      }),
      facebookConversation.recipientId,
      integration._id,
    );

  let sendResult;

  try {
    sendResult = await sendHandoffReply();
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    const shouldRetryWithTag =
      errorMessage.includes('outside of allowed window') && bot.tag;

    if (!shouldRetryWithTag) {
      throw new Error(errorMessage);
    }

    sendResult = await sendHandoffReply(bot.tag);
  }

  await models.FacebookConversationMessages.addBotMessage(subdomain, {
    conversationId: facebookConversation._id,
    botId: bot._id,
    botData: [{ type: 'text', text }],
    mid: String(
      sendResult?.mid ||
        sendResult?.message_id ||
        `automation-control-${conversation._id}-${Date.now()}`,
    ),
    conversationErxesApiId: conversation._id,
  });
};
