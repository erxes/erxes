import { graphqlPubsub } from 'erxes-api-shared/utils';
import { IModels } from '~/connectionResolvers';
import { IDiscordBotDocument } from '@/integrations/discord/@types/bot';
import {
  DiscordActivity,
  DiscordMessageDeleteEvent,
  DiscordPollVoteEvent,
  DiscordReactionEvent,
  DiscordTypingEvent,
} from '@/integrations/discord/@types/activity';
import {
  isIgnorableActivity,
  normalizeDiscordPoll,
  resolveDiscordMentions,
} from '@/integrations/discord/activity';
import { getMessage } from '@/integrations/discord/utils';
import { debugDiscord, debugError } from '@/integrations/discord/debuggers';

const resolveConversationByMessageId = async (
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

const updateInboxMessageExtra = async (
  models: IModels,
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

  await graphqlPubsub.publish(
    `conversationMessageInserted:${updated.conversationId}`,
    { conversationMessageInserted: updated },
  );

  return true;
};

export const receiveDiscordMessageEdit = async ({
  models,
  activity,
}: {
  models: IModels;
  activity: DiscordActivity;
}) => {
  if (isIgnorableActivity(activity, { allowBotAuthor: true })) {
    return;
  }

  const resolved = await resolveConversationByMessageId(
    models,
    activity.messageId,
  );

  if (!resolved) {
    return;
  }

  const { message, conversation } = resolved;

  if (activity.embeds?.length) {
    await updateInboxMessageExtra(models, activity.messageId, {
      embeds: activity.embeds,
    });
  }

  if (typeof activity.raw?.pinned === 'boolean') {
    await updateInboxMessageExtra(models, activity.messageId, {
      discordPinned: activity.raw.pinned,
    });
  }

  const editedContent =
    typeof activity.raw?.content === 'string' ? activity.content : undefined;

  if (editedContent === undefined) {
    return;
  }

  const displayContent = resolveDiscordMentions(
    editedContent,
    activity.mentions,
  );

  await models.DiscordConversationMessages.updateOne(
    { _id: message._id },
    { $set: { content: displayContent, updatedAt: new Date() } },
  );

  await updateInboxMessageExtra(
    models,
    activity.messageId,
    { discordEditedAt: new Date().toISOString() },
    { content: displayContent },
  );

  debugDiscord(
    `Discord message ${activity.messageId} edited in conversation ${conversation.erxesApiId}`,
  );
};

export const receiveDiscordMessageDelete = async ({
  models,
  event,
}: {
  models: IModels;
  event: DiscordMessageDeleteEvent;
}) => {
  for (const messageId of event.messageIds) {
    const resolved = await resolveConversationByMessageId(models, messageId);

    if (!resolved) {
      continue;
    }

    const deletedAt = new Date();

    await models.DiscordConversationMessages.updateOne(
      { _id: resolved.message._id },
      { $set: { deletedAt } },
    );

    await updateInboxMessageExtra(
      models,
      messageId,
      { discordDeletedAt: deletedAt.toISOString() },
      { content: '' },
    );

    debugDiscord(
      `Discord message ${messageId} deleted in conversation ${resolved.conversation.erxesApiId}`,
    );
  }
};

export const receiveDiscordPollVote = async ({
  models,
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

  const updated = await updateInboxMessageExtra(models, event.messageId, {
    poll,
  });

  if (updated) {
    debugDiscord(`Updated Discord poll ${event.messageId} tallies`);
  }
};

export const receiveDiscordReaction = async ({
  models,
  event,
}: {
  models: IModels;
  event: DiscordReactionEvent;
}) => {
  const inboxMessage = await models.ConversationMessages.findOne({
    'extraData.discordMessageId': event.messageId,
  });
  if (!inboxMessage) return;

  const extraData = inboxMessage.extraData || {};
  const current = Array.isArray(extraData.reactions)
    ? (extraData.reactions as Array<{ senderId: string; emoji: string }>)
    : [];
  const reactions = current.filter(
    (reaction) =>
      reaction.senderId !== event.userId || reaction.emoji !== event.emoji,
  );
  if (event.added) {
    reactions.push({ senderId: event.userId, emoji: event.emoji });
  }

  await updateInboxMessageExtra(models, event.messageId, { reactions });
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
