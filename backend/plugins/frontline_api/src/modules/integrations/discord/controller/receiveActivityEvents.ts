import { graphqlPubsub } from 'erxes-api-shared/utils';
import type { IModels } from '~/connectionResolvers';
import type { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import type {
  DiscordPollVoteEvent,
  DiscordTypingEvent,
} from '@/integrations/discord/@types/activity';
import { normalizeDiscordPoll } from '@/integrations/discord/utils/media/normalize';
import { getMessage } from '@/integrations/discord/utils/outbound/actions';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';
import { updateInboxMessageExtra } from '@/integrations/discord/services/messages/inboxUpdates';

export const receiveDiscordPollVote = async ({
  models,
  subdomain,
  bot,
  event,
}: {
  models: IModels;
  subdomain: string;
  bot: IDiscordBotDocument;
  event: DiscordPollVoteEvent;
}) => {
  if (!event.messageId || !event.channelId) {
    return;
  }

  let poll;
  try {
    const fetched = await getMessage(
      bot.token,
      event.channelId,
      event.messageId,
    );
    poll = normalizeDiscordPoll(fetched?.poll);
  } catch (e) {
    debugError(
      `Failed to fetch Discord poll ${event.messageId}: ${
        (e as Error).message
      }`,
    );
    return;
  }

  if (!poll) {
    return;
  }

  const updated = await updateInboxMessageExtra(
    models,
    subdomain,
    event.messageId,
    {
      poll,
    },
  );

  if (updated) {
    debugDiscord(`Updated Discord poll ${event.messageId} tallies`);
  }
};

export const receiveDiscordTyping = async ({
  models,
  bot,
  event,
}: {
  models: IModels;
  bot: IDiscordBotDocument;
  event: DiscordTypingEvent;
}) => {
  if (event.bot || !event.userId || event.userId === bot.applicationId) {
    return;
  }

  const conversation = await models.DiscordConversations.findOne({
    channelId: { $eq: event.channelId },
  });

  if (!conversation?.erxesApiId) {
    return;
  }

  const customer = await models.DiscordCustomers.findOne({
    userId: { $eq: event.userId },
  });

  await graphqlPubsub.publish(
    `conversationClientTypingStatusChanged:${conversation.erxesApiId}`,
    {
      conversationClientTypingStatusChanged: {
        conversationId: conversation.erxesApiId,
        customerId: customer?.erxesApiId,
        customerName: event.username || customer?.firstName || 'Discord user',
      },
    },
  );
};
