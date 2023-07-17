import { Messages } from './models';
import { DiscordBot } from './bot';

export const sendDiscordMessage = async (
  client: DiscordBot,
  conversationMessage
) => {
  const {
    conversationId: inboxConversationId,
    integrationId: inboxIntegrationId,
    content
  } = conversationMessage;

  const messages = await Messages.getMessages({
    inboxConversationId,
    inboxIntegrationId
  });
  const latestMessage = messages[messages.length - 1];

  await client.replyToMessage(latestMessage, conversationMessage);

  return { status: 'success', data: latestMessage };
};
