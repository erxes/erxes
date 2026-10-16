import type { IModels } from '~/connectionResolvers';
import { publishDiscordMessage } from '@/integrations/discord/services/messages/events';

export const resolveConversationByMessageId = async (
  models: IModels,
  messageId: string,
) => {
  if (!messageId) {
    return null;
  }

  const message = await models.DiscordConversationMessages.findOne({
    messageId: { $eq: messageId },
  });

  if (!message?.conversationId) {
    return null;
  }

  const conversation = await models.DiscordConversations.findById(
    message.conversationId,
  );

  if (!conversation?.erxesApiId) {
    return null;
  }

  return { message, conversation };
};

export const updateInboxMessageExtra = async (
  models: IModels,
  subdomain: string,
  discordMessageId: string,
  extraPatch: Record<string, unknown>,
  rootPatch: Record<string, unknown> = {},
): Promise<boolean> => {
  const setOps: Record<string, unknown> = { ...rootPatch };
  for (const [key, value] of Object.entries(extraPatch)) {
    setOps[`extraData.${key}`] = value;
  }

  const updated = await models.ConversationMessages.findOneAndUpdate(
    { 'extraData.discordMessageId': discordMessageId },
    { $set: setOps },
    { new: true },
  );

  if (!updated) {
    return false;
  }

  await publishDiscordMessage(
    updated.conversationId,
    updated.toObject(),
    subdomain,
  );

  return true;
};
