import type { IModels } from '~/connectionResolvers';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type {
  DiscordReactionEvent,
  DiscordReactionClearEvent,
} from '@/integrations/discord/@types/activity';
import { publishDiscordMessage } from '@/integrations/discord/services/messages/events';

/** Apply a Discord reaction event to the canonical inbox message. */
export const receiveDiscordReaction = async ({
  models,
  subdomain,
  bot,
  event,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  event: DiscordReactionEvent;
}) => {
  const isBotReaction = event.userId === bot.applicationId;
  const messageFilter = {
    'extraData.discordMessageId': event.messageId,
  };
  const providerReaction = {
    senderId: event.userId,
    emoji: event.emoji,
  };

  const updated = event.added
    ? await models.ConversationMessages.findOneAndUpdate(
        {
          ...messageFilter,
          ...(isBotReaction && {
            'extraData.reactions': {
              $not: {
                $elemMatch: {
                  emoji: event.emoji,
                  reaction: { $exists: true },
                },
              },
            },
          }),
        },
        {
          $addToSet: {
            'extraData.reactions': providerReaction,
            reactions: providerReaction,
          },
        },
        { new: true },
      )
    : await models.ConversationMessages.findOneAndUpdate(
        messageFilter,
        {
          $pull: {
            'extraData.reactions': providerReaction,
            reactions: providerReaction,
          },
        },
        { new: true },
      );

  if (!updated) return;

  await publishDiscordMessage(
    updated.conversationId,
    updated.toObject(),
    subdomain,
  );
};

export const receiveDiscordReactionClear = async ({
  models,
  subdomain,
  event,
}: {
  models: IModels;
  subdomain: string;
  event: DiscordReactionClearEvent;
}): Promise<void> => {
  const updated = await models.ConversationMessages.findOneAndUpdate(
    { 'extraData.discordMessageId': event.messageId },
    event.emoji === undefined
      ? { $set: { 'extraData.reactions': [], reactions: [] } }
      : {
          $pull: {
            'extraData.reactions': { emoji: event.emoji },
            reactions: { emoji: event.emoji },
          },
        },
    { new: true },
  );
  if (!updated) return;
  await publishDiscordMessage(
    updated.conversationId,
    updated.toObject(),
    subdomain,
  );
};
