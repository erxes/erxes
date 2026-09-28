import type { IConversationDocument } from '@/inbox/@types/conversations';
import { AUTOMATED_REPLY_STATUS } from '@/inbox/db/definitions/constants';
import { INTEGRATION_KINDS } from '@/integrations/facebook/constants';
import {
  DEFAULT_AUTOMATION_ACTIVE_MESSAGE,
  DEFAULT_HANDOFF_MESSAGE,
  sendMessengerBotText,
} from '@/integrations/facebook/services/messengerSend';
import type { IModels } from '~/connectionResolvers';

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

  const isActive = status === AUTOMATED_REPLY_STATUS.ACTIVE;
  const defaultText = isActive
    ? DEFAULT_AUTOMATION_ACTIVE_MESSAGE
    : DEFAULT_HANDOFF_MESSAGE;
  const configuredText = isActive
    ? bot.automationActiveMessage
    : bot.handoffMessage;

  await sendMessengerBotText({
    models,
    subdomain,
    integrationId: integration._id,
    facebookConversation,
    conversationErxesApiId: conversation._id,
    bot,
    text: (configuredText || defaultText).trim() || defaultText,
    fallbackMid: `automation-control-${conversation._id}-${Date.now()}`,
  });
};
