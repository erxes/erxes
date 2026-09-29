import type { IFacebookConversationDocument } from '@/integrations/facebook/@types/conversations';
import type { IFacebookBotDocument } from '@/integrations/facebook/db/definitions/bots';
import { sendReply } from '@/integrations/facebook/messageActions';
import { getErrorMessage } from '@/integrations/utils';
import type { IModels } from '~/connectionResolvers';

export const DEFAULT_HANDOFF_MESSAGE =
  'A teammate will take over shortly. Automated replies are paused.';

export const DEFAULT_AUTOMATION_ACTIVE_MESSAGE =
  'Automated replies are active again.';

const OUTSIDE_WINDOW_ERROR = 'outside of allowed window';

export const buildMessagingParams = (
  tag?: string | null,
): { messaging_type: string; tag?: string } => {
  const trimmedTag = tag?.trim();

  return trimmedTag
    ? { messaging_type: 'MESSAGE_TAG', tag: trimmedTag }
    : { messaging_type: 'RESPONSE' };
};

export const sendMessengerBotText = async ({
  models,
  subdomain,
  integrationId,
  facebookConversation,
  conversationErxesApiId,
  bot,
  text,
  fallbackMid,
}: {
  models: IModels;
  subdomain: string;
  integrationId: string;
  facebookConversation: IFacebookConversationDocument;
  conversationErxesApiId: string;
  bot: IFacebookBotDocument;
  text: string;
  fallbackMid: string;
}) => {
  const send = (tag?: string) =>
    sendReply(
      models,
      'me/messages',
      {
        recipient: { id: facebookConversation.senderId },
        message: { text },
        ...buildMessagingParams(tag),
      },
      facebookConversation.recipientId,
      integrationId,
    );

  let sendResult;

  try {
    sendResult = await send();
  } catch (error) {
    const errorMessage = getErrorMessage(error);

    if (!errorMessage.includes(OUTSIDE_WINDOW_ERROR) || !bot.tag) {
      throw new Error(errorMessage);
    }

    sendResult = await send(bot.tag);
  }

  await models.FacebookConversationMessages.addBotMessage(subdomain, {
    conversationId: facebookConversation._id,
    botId: bot._id,
    botData: [{ type: 'text', text }],
    mid: String(sendResult?.mid || sendResult?.message_id || fallbackMid),
    conversationErxesApiId,
  });
};
